/**
 * Interaction conversions: speech status, greeter and conversation JSON,
 * visitors around the robot.
 */

import type { SpeechStatusWire, VisitorsWire } from "@/types/ros/molly";
import type {
  ConversationEntry,
  GreeterSnapshot,
  SpeechSnapshot,
  SpeechState,
  VisitorsSnapshot,
} from "@/types/ui";

const SPEECH_STATES: ReadonlyArray<SpeechState> = [
  "idle",
  "speaking",
  "done",
  "failed",
  "cancelled",
];

export const IDLE_SPEECH: SpeechSnapshot = {
  id: 0,
  state: "idle",
  text: "",
  language: "",
  queued: 0,
  engine: "",
  message: "",
};

export const NO_VISITORS: VisitorsSnapshot = {
  positions: [],
  count: 0,
  front: 0,
  behind: 0,
  nearest: null,
  nearestFront: null,
  nearestBehind: null,
};

export function decodeSpeechStatus(w: SpeechStatusWire): SpeechSnapshot {
  return {
    id: w.id,
    state: (SPEECH_STATES as readonly string[]).includes(w.state)
      ? (w.state as SpeechState)
      : "idle",
    text: w.text,
    language: w.language,
    queued: w.queued,
    engine: w.engine,
    message: w.message,
  };
}

/** Distances use -1 for "nobody" on the wire. */
function distance(value: number): number | null {
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function decodeVisitors(w: VisitorsWire): VisitorsSnapshot {
  return {
    positions: w.positions.map((p, i) => ({
      x: p.x,
      y: p.y,
      confidence: w.confidences[i] ?? 1,
    })),
    count: w.count,
    front: w.front,
    behind: w.behind,
    nearest: distance(w.nearest),
    nearestFront: distance(w.nearest_front),
    nearestBehind: distance(w.nearest_behind),
  };
}

function parseObject(raw: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(raw);
    return typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** /interaction/greeter: {enabled, state, last_greet_age}. */
export function parseGreeter(raw: string): GreeterSnapshot | null {
  const o = parseObject(raw);
  if (!o) return null;
  const age = o.last_greet_age;
  return {
    enabled: o.enabled === true,
    state: typeof o.state === "string" ? o.state : "",
    lastGreetAge: typeof age === "number" && Number.isFinite(age) ? age : null,
  };
}

/** /interaction/conversation: {question, answer, ms, ok}. */
export function parseConversation(
  raw: string,
  at: number,
): ConversationEntry | null {
  const o = parseObject(raw);
  if (!o || typeof o.question !== "string") return null;
  return {
    id: `c_${at}_${Math.random().toString(36).slice(2, 7)}`,
    question: o.question,
    answer: typeof o.answer === "string" ? o.answer : "",
    ms: typeof o.ms === "number" ? o.ms : null,
    ok: o.ok !== false,
    pending: false,
    at,
  };
}
