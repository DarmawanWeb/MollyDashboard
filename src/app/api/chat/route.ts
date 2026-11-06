/**
 * Molly's LLM gateway.
 *
 *   GET  /api/chat   whether an external LLM is configured (no secrets)
 *   POST /api/chat   ask: builds Molly's prompt (persona, venue knowledge,
 *                    the live robot context the screen sends, recent turns)
 *                    and streams the answer of the OpenAI-compatible
 *                    LLM_API_URL back as plain text; successful answers go
 *                    into the conversation history.
 */

import { plainText } from "@/lib/conversation/text";
import { readLlmConfig } from "@/server/assistant/config";
import { completionChunks, LlmError } from "@/server/assistant/llm";
import { buildMessages, readKnowledge } from "@/server/assistant/prompt";
import { createThinkFilter } from "@/server/assistant/think-filter";
import { recordConversation } from "@/server/conversations";
import { clientKey, createRateLimiter, json } from "@/server/request";
import { parseAssistantRequest } from "@/server/validate";
import type { AssistantStatus } from "@/types/ui";

export const dynamic = "force-dynamic";

/** Per visitor screen / address: plenty for people, a wall for scripts. */
const limit = createRateLimiter(20, 60_000);

export function GET() {
  const config = readLlmConfig();
  let host = "";
  if (config) {
    try {
      host = new URL(config.endpoint).host;
    } catch {
      host = "";
    }
  }
  const status: AssistantStatus = {
    external: config !== null,
    model: config?.model ?? "",
    host,
  };
  return json(status);
}

export async function POST(req: Request) {
  const config = readLlmConfig();
  if (!config) {
    return json(
      { error: "not_configured", message: "LLM_API_URL is not set" },
      503,
    );
  }

  const gate = limit(clientKey(req));
  if (!gate.ok) {
    return json({ error: "rate_limited", message: "Too many questions" }, 429, {
      "Retry-After": String(gate.retryAfterSec),
    });
  }

  const parsed = parseAssistantRequest(await req.json().catch(() => null));
  if (typeof parsed === "string") {
    return json({ error: "bad_request", message: parsed }, 400);
  }

  const messages = buildMessages({
    question: parsed.question,
    language: parsed.language,
    context: parsed.context,
    history: parsed.history,
    knowledge: readKnowledge(config.contextFile),
    extraPrompt: config.extraPrompt,
    timeZone: config.timeZone,
  });

  const started = Date.now();
  const chunks = completionChunks(config, messages, req.signal);
  const filter = createThinkFilter();
  const encoder = new TextEncoder();

  // Wait for the first visible text before answering, so an LLM that is
  // down or rejects the key becomes a proper HTTP error, not a broken stream.
  let first = "";
  try {
    while (!first) {
      const next = await chunks.next();
      if (next.done) {
        first = filter.flush();
        break;
      }
      first = filter.push(next.value);
    }
  } catch (err) {
    const status = err instanceof LlmError && err.status ? err.status : 0;
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[assistant] ${message}`);
    return json(
      { error: "llm_failed", message, status },
      status === 429 ? 429 : 502,
    );
  }

  let answer = first;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      if (first) controller.enqueue(encoder.encode(first));
    },
    async pull(controller) {
      try {
        const next = await chunks.next();
        if (!next.done) {
          const text = filter.push(next.value);
          if (text) {
            answer += text;
            controller.enqueue(encoder.encode(text));
          }
          return;
        }
        const rest = filter.flush();
        if (rest) {
          answer += rest;
          controller.enqueue(encoder.encode(rest));
        }

        // store before closing, so the screen's follow-up (spoken: true)
        // lands after this entry, never before it
        const clean = plainText(answer);
        if (clean) {
          const now = Date.now();
          await recordConversation({
            id: parsed.id,
            question: parsed.question,
            answer: clean,
            ms: now - started,
            ok: true,
            at: started,
            updatedAt: now,
            language: parsed.language,
            engine: "llm",
            source: "screen",
            spoken: false,
          }).catch((err) => console.error(`[history] ${String(err)}`));
        }
        controller.close();
      } catch (err) {
        console.error(
          `[assistant] stream: ${err instanceof Error ? err.message : String(err)}`,
        );
        controller.error(err);
      }
    },
    cancel() {
      void chunks.return(undefined);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
