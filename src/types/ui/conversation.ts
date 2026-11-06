/**
 * Conversations with Molly: questions from the screen or asked to the robot
 * in person, answers from the external LLM gateway or the robot's own
 * conversation node, and the live context the gateway puts in the prompt.
 */

/** Who answered: the dashboard's LLM gateway or the robot (/interaction/ask). */
export type AnswerEngine = "llm" | "robot";

/** Where the question came from: typed on a screen, or asked to the robot. */
export type QuestionSource = "screen" | "robot";

/** Answer language. */
export type ChatLanguage = "id" | "en";

/** Which engine the operator wants; "auto" prefers the LLM when configured. */
export type EngineChoice = "auto" | "llm" | "robot";

export interface ConversationEntry {
  id: string;
  question: string;
  answer: string;
  /** Answer latency in ms, null while pending */
  ms: number | null;
  ok: boolean;
  /** Still waiting for (or streaming) the answer; never stored */
  pending: boolean;
  /** Asked at, ms since epoch */
  at: number;
  /** Last change, ms since epoch (history sync watermark) */
  updatedAt: number;
  language: ChatLanguage;
  engine: AnswerEngine;
  source: QuestionSource;
  /** The robot said the answer out loud */
  spoken: boolean;
}

/** What the server keeps: an entry without the client-only flag. */
export type StoredConversation = Omit<ConversationEntry, "pending">;

/** A stop or place the assistant may talk about. */
export interface AssistantPlace {
  name: string;
  description: string;
  narration: string;
}

/**
 * Live robot state the dashboard sends with a question; the gateway turns
 * it into the "right now" part of the system prompt.
 */
export interface AssistantContext {
  /** "live": a real robot is connected, "demo": the in-memory robot */
  mode: "live" | "demo";
  site: string;
  /** Named place the robot is at or next to, empty when none */
  place: string;
  /** What the robot is doing, in plain words */
  activity: string;
  /** 0..100, null when unknown */
  battery: number | null;
  visitorsNearby: number;
  tour: {
    name: string;
    state: string;
    /** Current stop */
    stop: string;
    /** 1-based */
    index: number;
    total: number;
    /** Next stop, empty after the last */
    next: string;
  } | null;
  places: AssistantPlace[];
}

/** One earlier exchange, oldest first, for follow-up questions. */
export interface AssistantTurn {
  question: string;
  answer: string;
}

/** POST /api/chat */
export interface AssistantRequest {
  id: string;
  question: string;
  language: ChatLanguage;
  context: AssistantContext;
  history: AssistantTurn[];
}

/** GET /api/chat: whether an external LLM is configured (no secrets). */
export interface AssistantStatus {
  external: boolean;
  /** Model name, empty when the server sends none */
  model: string;
  /** Host of the LLM endpoint, e.g. "api.openai.com" */
  host: string;
}

/** GET /api/conversations */
export interface ConversationPage {
  entries: StoredConversation[];
  /** Server clock, ms since epoch */
  now: number;
  /** Last time the history was cleared, 0 when never */
  clearedAt: number;
}
