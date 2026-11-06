/**
 * Conversation history shared by every screen.
 *
 *   GET    /api/conversations?since=<ms>&limit=<n>   entries changed after `since`
 *   POST   /api/conversations {entry}                store one, returns the canonical entry
 *   DELETE /api/conversations                        clear the history
 */

import {
  clearConversations,
  listConversations,
  recordConversation,
} from "@/server/conversations";
import { clientKey, createRateLimiter, json } from "@/server/request";
import { parseStoredConversation } from "@/server/validate";
import type { ConversationPage } from "@/types/ui";

export const dynamic = "force-dynamic";

const writeLimit = createRateLimiter(60, 60_000);

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const since = Number(params.get("since") ?? 0);
  const limit = Number(params.get("limit") ?? 300);
  const page = await listConversations({
    since: Number.isFinite(since) ? since : 0,
    limit: Number.isFinite(limit) ? limit : 300,
  });
  const body: ConversationPage = { ...page, now: Date.now() };
  return json(body);
}

export async function POST(req: Request) {
  if (!writeLimit(clientKey(req)).ok) {
    return json({ error: "rate_limited" }, 429);
  }
  const body = (await req.json().catch(() => null)) as { entry?: unknown };
  const parsed = parseStoredConversation(body?.entry, Date.now());
  if (typeof parsed === "string") {
    return json({ error: "bad_request", message: parsed }, 400);
  }
  return json({ entry: await recordConversation(parsed) });
}

export async function DELETE() {
  return json({ clearedAt: await clearConversations() });
}
