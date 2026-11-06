/**
 * Hides <think>…</think> reasoning that some models (DeepSeek-R1, Qwen3 and
 * others served by Ollama) put in the answer text, while streaming: text
 * that could still turn into a tag is held back until it is clear.
 */

const OPEN = "<think>";
const CLOSE_RE = /<think>[\s\S]*?<\/think>/g;

function visible(raw: string, final: boolean): string {
  let out = raw.replace(CLOSE_RE, "");
  const open = out.indexOf(OPEN);
  if (open !== -1) out = out.slice(0, open); // still thinking
  if (!final) {
    // hold back a possible partial "<think>" at the end
    for (let k = Math.min(OPEN.length - 1, out.length); k > 0; k--) {
      if (OPEN.startsWith(out.slice(-k))) {
        out = out.slice(0, -k);
        break;
      }
    }
  }
  return out.trimStart();
}

export interface ThinkFilter {
  /** Feed a chunk, get the text that can be shown now. */
  push: (chunk: string) => string;
  /** End of stream: whatever was held back. */
  flush: () => string;
}

export function createThinkFilter(): ThinkFilter {
  let raw = "";
  let shown = 0;
  const next = (final: boolean) => {
    const text = visible(raw, final);
    if (text.length <= shown) return "";
    const delta = text.slice(shown);
    shown = text.length;
    return delta;
  };
  return {
    push: (chunk) => {
      raw += chunk;
      return next(false);
    },
    flush: () => next(true),
  };
}
