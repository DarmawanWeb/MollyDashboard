/**
 * Visitor interaction types: speech, greeter, visitors. Conversations are
 * in conversation.ts.
 */

import type { Language } from "./poi";

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

/** A one-tap phrase on the speech panel. */
export interface QuickPhrase {
  text: string;
  language: Language;
}
