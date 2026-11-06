/**
 * Conversation history on the server: one JSON line per exchange in
 * $DATA_DIR/conversations.jsonl (./data by default, a volume in Docker),
 * kept in memory after the first read. Every screen loads it and polls for
 * new entries, so the display and the operator see the same history.
 *
 * Writes are serialized; if the disk is not writable the history keeps
 * working in memory until the server restarts.
 */

import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { conversationKey } from "@/lib/conversation/text";
import type { StoredConversation } from "@/types/ui";

const MAX_ENTRIES = 2000;
/** Same exchange reported by several screens within this window: one entry */
const DUPLICATE_WINDOW_MS = 3 * 60_000;

const dataDir = () =>
  process.env.DATA_DIR?.trim() ||
  path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
const historyFile = () => path.join(dataDir(), "conversations.jsonl");
const metaFile = () => path.join(dataDir(), "conversations.meta.json");

let entries: StoredConversation[] | null = null;
let clearedAt = 0;
let writes: Promise<void> = Promise.resolve();
let warned = false;

function warn(err: unknown) {
  if (warned) return;
  warned = true;
  console.warn(
    `[history] cannot write ${historyFile()} (${String(err)}); keeping the history in memory`,
  );
}

function queue(task: () => Promise<void>): Promise<void> {
  writes = writes.then(task).catch(warn);
  return writes;
}

async function load(): Promise<StoredConversation[]> {
  if (entries) return entries;
  const loaded: StoredConversation[] = [];
  try {
    const raw = await readFile(historyFile(), "utf8");
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        loaded.push(JSON.parse(line) as StoredConversation);
      } catch {
        // a torn last line after a crash: skip it
      }
    }
  } catch {
    // no history yet
  }
  try {
    const meta = JSON.parse(await readFile(metaFile(), "utf8")) as {
      clearedAt?: number;
    };
    clearedAt = typeof meta.clearedAt === "number" ? meta.clearedAt : 0;
  } catch {
    clearedAt = 0;
  }
  // a later line with the same id replaces the earlier one
  const byId = new Map<string, StoredConversation>();
  for (const e of loaded) byId.set(e.id, e);
  entries = [...byId.values()].sort((a, b) => a.at - b.at).slice(-MAX_ENTRIES);
  return entries;
}

function rewrite(list: StoredConversation[]): Promise<void> {
  return queue(async () => {
    await mkdir(dataDir(), { recursive: true });
    const body = list.map((e) => JSON.stringify(e)).join("\n");
    await writeFile(historyFile(), body ? `${body}\n` : "");
  });
}

export async function listConversations(options: {
  since?: number;
  limit?: number;
}): Promise<{ entries: StoredConversation[]; clearedAt: number }> {
  const all = await load();
  const since = options.since ?? 0;
  const limit = Math.min(Math.max(options.limit ?? 300, 1), MAX_ENTRIES);
  const changed = since > 0 ? all.filter((e) => e.updatedAt > since) : all;
  return { entries: changed.slice(-limit), clearedAt };
}

/**
 * Store an exchange. The same id updates it; the same question and answer
 * reported again within a few minutes (several screens hearing the robot)
 * returns the entry already stored. Returns the canonical entry.
 */
export async function recordConversation(
  entry: StoredConversation,
): Promise<StoredConversation> {
  const all = await load();

  const index = all.findIndex((e) => e.id === entry.id);
  if (index !== -1) {
    const merged = { ...all[index], ...entry, updatedAt: Date.now() };
    all[index] = merged;
    await rewrite(all);
    return merged;
  }

  const key = conversationKey(entry.question, entry.answer);
  const twin = all.findLast(
    (e) =>
      Math.abs(e.at - entry.at) < DUPLICATE_WINDOW_MS &&
      conversationKey(e.question, e.answer) === key,
  );
  if (twin) return twin;

  all.push(entry);
  all.sort((a, b) => a.at - b.at);
  if (all.length > MAX_ENTRIES + 200) {
    all.splice(0, all.length - MAX_ENTRIES);
    await rewrite(all);
  } else {
    await queue(async () => {
      await mkdir(dataDir(), { recursive: true });
      await appendFile(historyFile(), `${JSON.stringify(entry)}\n`);
    });
  }
  return entry;
}

export async function clearConversations(): Promise<number> {
  const all = await load();
  all.length = 0;
  clearedAt = Date.now();
  await rewrite(all);
  await queue(async () => {
    await writeFile(metaFile(), JSON.stringify({ clearedAt }));
  });
  return clearedAt;
}
