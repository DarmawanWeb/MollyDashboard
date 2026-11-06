/**
 * Browser side of the conversation endpoints (/api/chat, /api/conversations).
 * Network failures resolve to null / false where the caller can carry on.
 */

import type {
  AssistantRequest,
  AssistantStatus,
  ConversationEntry,
  ConversationPage,
  StoredConversation,
} from "@/types/ui";

/** An entry as the server stores it (without the client-only flag). */
export function toStored(entry: ConversationEntry): StoredConversation {
  const { pending, ...stored } = entry;
  void pending;
  return stored;
}

export class AssistantError extends Error {
  constructor(
    message: string,
    /** HTTP status, 0 for network errors */
    readonly status: number,
    /** Server error code: not_configured, rate_limited, llm_failed, … */
    readonly code: string,
  ) {
    super(message);
    this.name = "AssistantError";
  }
}

export async function fetchAssistantStatus(): Promise<AssistantStatus | null> {
  try {
    const res = await fetch("/api/chat", { cache: "no-store" });
    return res.ok ? ((await res.json()) as AssistantStatus) : null;
  } catch {
    return null;
  }
}

/**
 * Ask the LLM gateway and stream the answer: `onText` gets every new piece.
 * Resolves with the whole answer; throws AssistantError.
 */
export async function streamAnswer(
  request: AssistantRequest,
  onText: (piece: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
  } catch (err) {
    throw new AssistantError(String(err), 0, "network");
  }

  if (!res.ok || !res.body) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };
    throw new AssistantError(
      body.message ?? `HTTP ${res.status}`,
      res.status,
      body.error ?? "http",
    );
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let answer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        answer += value;
        onText(value);
      }
    }
  } catch (err) {
    throw new AssistantError(String(err), 0, "stream");
  }
  return answer;
}

export async function fetchConversations(
  since = 0,
): Promise<ConversationPage | null> {
  try {
    const res = await fetch(`/api/conversations?since=${since}`, {
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as ConversationPage) : null;
  } catch {
    return null;
  }
}

/** Store an exchange; resolves with the canonical entry, or null. */
export async function saveConversation(
  entry: StoredConversation,
): Promise<StoredConversation | null> {
  try {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry }),
    });
    if (!res.ok) return null;
    return ((await res.json()) as { entry: StoredConversation }).entry;
  } catch {
    return null;
  }
}

export async function clearConversationHistory(): Promise<number | null> {
  try {
    const res = await fetch("/api/conversations", { method: "DELETE" });
    if (!res.ok) return null;
    return ((await res.json()) as { clearedAt: number }).clearedAt;
  } catch {
    return null;
  }
}
