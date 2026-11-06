/**
 * Checks for what browsers send: questions with live context, and
 * conversation entries to store. Everything is clipped to sane sizes, since
 * the endpoints are reachable by anyone who can open the dashboard.
 */

import { isConversationId } from "@/lib/conversation/text";
import type {
  AssistantContext,
  AssistantPlace,
  AssistantRequest,
  AssistantTurn,
  ChatLanguage,
  StoredConversation,
} from "@/types/ui";

export const LIMITS = {
  question: 500,
  answer: 4000,
  places: 40,
  history: 6,
  historyText: 600,
  field: 200,
  about: 400,
} as const;

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function language(v: unknown): ChatLanguage {
  return v === "en" ? "en" : "id";
}

function place(v: unknown): AssistantPlace | null {
  if (!isObj(v)) return null;
  const name = str(v.name, LIMITS.field);
  if (!name) return null;
  return {
    name,
    description: str(v.description, LIMITS.about),
    narration: str(v.narration, LIMITS.about),
  };
}

function context(v: unknown): AssistantContext {
  const c = isObj(v) ? v : {};
  const t = isObj(c.tour) ? c.tour : null;
  const battery = num(c.battery, Number.NaN);
  return {
    mode: c.mode === "live" ? "live" : "demo",
    site: str(c.site, LIMITS.field),
    place: str(c.place, LIMITS.field),
    activity: str(c.activity, LIMITS.field),
    battery: Number.isFinite(battery)
      ? Math.min(100, Math.max(0, battery))
      : null,
    visitorsNearby: Math.min(
      99,
      Math.max(0, Math.round(num(c.visitorsNearby, 0))),
    ),
    tour: t
      ? {
          name: str(t.name, LIMITS.field),
          state: str(t.state, 40),
          stop: str(t.stop, LIMITS.field),
          index: Math.max(0, Math.round(num(t.index, 0))),
          total: Math.max(0, Math.round(num(t.total, 0))),
          next: str(t.next, LIMITS.field),
        }
      : null,
    places: (Array.isArray(c.places) ? c.places : [])
      .slice(0, LIMITS.places)
      .map(place)
      .filter((p): p is AssistantPlace => p !== null),
  };
}

function turns(v: unknown): AssistantTurn[] {
  return (Array.isArray(v) ? v : [])
    .slice(-LIMITS.history)
    .filter(isObj)
    .map((t) => ({
      question: str(t.question, LIMITS.historyText),
      answer: str(t.answer, LIMITS.historyText),
    }))
    .filter((t) => t.question && t.answer);
}

export function parseAssistantRequest(
  body: unknown,
): AssistantRequest | string {
  if (!isObj(body)) return "expected a JSON object";
  if (!isConversationId(body.id)) return "invalid id";
  const question = str(body.question, LIMITS.question);
  if (!question) return "empty question";
  return {
    id: body.id,
    question,
    language: language(body.language),
    context: context(body.context),
    history: turns(body.history),
  };
}

export function parseStoredConversation(
  v: unknown,
  now: number,
): StoredConversation | string {
  if (!isObj(v)) return "expected an entry";
  if (!isConversationId(v.id)) return "invalid id";
  const question = str(v.question, LIMITS.question * 2);
  const answer = str(v.answer, LIMITS.answer);
  if (!question || !answer) return "question and answer are required";
  const at = num(v.at, now);
  return {
    id: v.id,
    question,
    answer,
    ms:
      typeof v.ms === "number" && Number.isFinite(v.ms)
        ? Math.round(v.ms)
        : null,
    ok: v.ok !== false,
    // a skewed browser clock must not reorder the history into the future
    at: Math.min(at, now),
    updatedAt: now,
    language: language(v.language),
    engine: v.engine === "llm" ? "llm" : "robot",
    source: v.source === "robot" ? "robot" : "screen",
    spoken: v.spoken === true,
  };
}
