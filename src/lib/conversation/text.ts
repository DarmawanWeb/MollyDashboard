/**
 * Text helpers shared by the browser and the server: answers as plain
 * spoken text, ids, and the key that recognizes one exchange reported by
 * several screens.
 */

/** Markdown and stray symbols an answer should not show or speak. */
export function plainText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(^|\s)[*_]([^*_\n]+)[*_](?=\s|[.,!?]|$)/g, "$1$2")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * An answer while it streams in: markdown markers vanish at once, even
 * before their closing pair arrives (plainText cleans the final answer).
 */
export function streamingText(text: string): string {
  return text
    .replace(/\*\*|__|`/g, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .trimStart();
}

/** Same question and answer, whitespace and case aside. */
export function conversationKey(question: string, answer: string): string {
  const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
  return `${norm(question)}\u0000${norm(answer)}`;
}

/** Same question, whitespace and case aside. */
export function sameQuestion(a: string, b: string): boolean {
  const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
  return norm(a) === norm(b);
}

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function isConversationId(value: unknown): value is string {
  return typeof value === "string" && ID_PATTERN.test(value);
}

/** A new conversation id, e.g. "q_lq3k9c_x7f2a". */
export function newConversationId(prefix = "q"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
