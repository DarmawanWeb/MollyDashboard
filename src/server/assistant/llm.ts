/**
 * Minimal OpenAI-compatible chat completions client with streaming
 * (server-sent events). Falls back to a plain JSON answer for servers that
 * ignore `stream: true`.
 */

import type { LlmConfig } from "./config";
import type { ChatMessage } from "./prompt";

export class LlmError extends Error {
  constructor(
    message: string,
    /** HTTP status of the LLM's answer, 0 for network / timeout */
    readonly status: number,
  ) {
    super(message);
    this.name = "LlmError";
  }
}

type Json = Record<string, unknown>;

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  // some servers send content parts: [{ type: "text", text: "…" }]
  if (Array.isArray(value)) {
    return value
      .map((part) =>
        typeof part === "object" && part !== null && "text" in part
          ? String((part as Json).text ?? "")
          : "",
      )
      .join("");
  }
  return "";
}

function choice(json: Json): Json {
  const choices = json.choices;
  return Array.isArray(choices) && typeof choices[0] === "object"
    ? (choices[0] as Json)
    : {};
}

function deltaText(json: Json): string {
  const c = choice(json);
  const delta = (c.delta ?? {}) as Json;
  const message = (c.message ?? {}) as Json;
  return asText(delta.content) || asText(message.content) || asText(c.text);
}

function errorMessage(json: Json): string | null {
  const err = json.error;
  if (!err) return null;
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as Json).message);
  }
  return "error";
}

/**
 * Stream the model's answer as text pieces (reasoning tags included; see
 * think-filter.ts). Throws LlmError on HTTP errors, timeouts and error
 * events.
 */
export async function* completionChunks(
  config: LlmConfig,
  messages: ChatMessage[],
  signal: AbortSignal,
): AsyncGenerator<string> {
  const body: Json = {
    messages,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: true,
  };
  if (config.model) body.model = config.model;

  let res: Response;
  try {
    res = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream, application/json",
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.any([signal, AbortSignal.timeout(config.timeoutMs)]),
      cache: "no-store",
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    throw new LlmError(
      timedOut ? "LLM timed out" : `LLM not reachable: ${String(err)}`,
      0,
    );
  }

  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    console.error(`[assistant] LLM answered ${res.status}: ${detail}`);
    throw new LlmError(`LLM answered ${res.status}`, res.status);
  }

  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("text/event-stream") || !res.body) {
    const json = (await res.json().catch(() => ({}))) as Json;
    const failure = errorMessage(json);
    if (failure) throw new LlmError(failure, res.status);
    const text = deltaText(json);
    if (text) yield text;
    return;
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf("\n");
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") return;
        let json: Json;
        try {
          json = JSON.parse(data) as Json;
        } catch {
          continue; // keep-alive or a partial line from a sloppy server
        }
        const failure = errorMessage(json);
        if (failure) throw new LlmError(failure, res.status);
        const text = deltaText(json);
        if (text) yield text;
      }
    }
  } catch (err) {
    if (err instanceof LlmError) throw err;
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    throw new LlmError(
      timedOut ? "LLM timed out" : `LLM stream broke: ${String(err)}`,
      0,
    );
  } finally {
    reader.releaseLock();
  }
}
