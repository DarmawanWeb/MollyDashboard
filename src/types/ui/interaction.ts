/**
 * Visitor interaction types: speech, greeter, conversation, visitors.
 */

export type SpeechState = "idle" | "speaking" | "done" | "failed" | "cancelled";

export interface SpeechSnapshot {
  id: number;
  state: SpeechState;
  text: string;
  language: string;
  queued: number;
  engine: string;
  message: string;
}

export interface GreeterSnapshot {
  enabled: boolean;
  state: string;
  /** s since the last greeting, null when never */
  lastGreetAge: number | null;
}

export interface ConversationEntry {
  id: string;
  question: string;
  answer: string;
  /** model latency in ms, null while pending */
  ms: number | null;
  ok: boolean;
  pending: boolean;
  /** ms since epoch */
  at: number;
}

/** A visitor next to the robot, base_link frame (x forward, y left). */
export interface VisitorPoint {
  x: number;
  y: number;
  confidence: number;
}

export interface VisitorsSnapshot {
  positions: VisitorPoint[];
  count: number;
  front: number;
  behind: number;
  /** m, null when nobody */
  nearest: number | null;
  nearestFront: number | null;
  nearestBehind: number | null;
}
