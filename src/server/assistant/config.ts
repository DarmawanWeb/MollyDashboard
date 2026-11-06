/**
 * External LLM settings, read from the server environment (never sent to
 * the browser): any OpenAI-compatible chat completions API — OpenAI,
 * OpenRouter, Groq, Together, a vLLM / LM Studio / llama.cpp server, or
 * Ollama's /v1.
 */

export interface LlmConfig {
  /** Full chat completions URL */
  endpoint: string;
  apiKey: string;
  /** Empty: the field is left out (servers with a single model) */
  model: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  /** Extra instructions appended to Molly's system prompt */
  extraPrompt: string;
  /** Markdown file with venue knowledge, put in the system prompt */
  contextFile: string;
  /** IANA zone for "now" in the prompt */
  timeZone: string;
}

function number(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const v = Number(raw);
  return Number.isFinite(v) && raw !== undefined && raw.trim() !== ""
    ? Math.min(max, Math.max(min, v))
    : fallback;
}

/**
 * The chat completions URL for a base or full URL:
 *   https://api.openai.com/v1                → …/v1/chat/completions
 *   http://localhost:11434                   → …/v1/chat/completions
 *   https://host/openai/v1/chat/completions  → as given
 */
export function chatCompletionsUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const path = url.pathname.replace(/\/+$/, "");
  if (path.endsWith("/chat/completions")) {
    url.pathname = path;
  } else if (path === "") {
    url.pathname = "/v1/chat/completions";
  } else {
    url.pathname = `${path}/chat/completions`;
  }
  return url.toString();
}

/** The configured LLM, or null when LLM_API_URL is unset or invalid. */
export function readLlmConfig(): LlmConfig | null {
  const raw = process.env.LLM_API_URL ?? "";
  if (!raw.trim()) return null;
  const endpoint = chatCompletionsUrl(raw);
  if (!endpoint) {
    console.warn(`[assistant] LLM_API_URL is not an http(s) URL: "${raw}"`);
    return null;
  }
  return {
    endpoint,
    apiKey: (process.env.LLM_API_KEY ?? "").trim(),
    model: (process.env.LLM_MODEL ?? "").trim(),
    temperature: number(process.env.LLM_TEMPERATURE, 0.5, 0, 2),
    maxTokens: number(process.env.LLM_MAX_TOKENS, 320, 32, 4096),
    timeoutMs: number(process.env.LLM_TIMEOUT_MS, 45_000, 2_000, 180_000),
    extraPrompt: (process.env.LLM_SYSTEM_PROMPT ?? "").trim(),
    contextFile: (process.env.LLM_CONTEXT_FILE ?? "config/assistant.md").trim(),
    timeZone: (process.env.LLM_TIMEZONE ?? "Asia/Jakarta").trim(),
  };
}
