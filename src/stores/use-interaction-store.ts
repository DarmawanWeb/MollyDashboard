import { create } from "zustand";

import type {
  ConversationEntry,
  GreeterSnapshot,
  SpeechSnapshot,
  VisitorsSnapshot,
} from "@/types";

const MAX_CONVERSATION = 100;

interface InteractionStore {
  /** interaction/speech_status */
  speech: SpeechSnapshot;
  /** interaction/greeter, null until the greeter reports */
  greeter: GreeterSnapshot | null;
  /** Questions and answers, oldest first */
  conversation: ConversationEntry[];
  /** perception/visitors */
  visitors: VisitorsSnapshot;

  setSpeech: (speech: SpeechSnapshot) => void;
  setGreeter: (greeter: GreeterSnapshot) => void;
  setVisitors: (visitors: VisitorsSnapshot) => void;
  /** Append an entry (a pending question or a robot-reported exchange). */
  addConversation: (entry: ConversationEntry) => void;
  /** Replace a pending entry by id with its answer. */
  resolveConversation: (id: string, patch: Partial<ConversationEntry>) => void;
  clearConversation: () => void;
  /** Forget the robot-reported state (the conversation history stays). */
  reset: () => void;
}

/**
 * Visitor interaction: speech, greeter, conversation and who is around.
 */
const INITIAL = {
  speech: {
    id: 0,
    state: "idle",
    text: "",
    language: "",
    queued: 0,
    engine: "",
    message: "",
  },
  greeter: null,
  visitors: {
    positions: [],
    count: 0,
    front: 0,
    behind: 0,
    nearest: null,
    nearestFront: null,
    nearestBehind: null,
  },
} satisfies Pick<InteractionStore, "speech" | "greeter" | "visitors">;

export const useInteractionStore = create<InteractionStore>((set) => ({
  ...INITIAL,
  conversation: [],

  setSpeech: (speech) => set({ speech }),
  setGreeter: (greeter) => set({ greeter }),
  setVisitors: (visitors) => set({ visitors }),
  addConversation: (entry) =>
    set((prev) => ({
      conversation: [...prev.conversation, entry].slice(-MAX_CONVERSATION),
    })),
  resolveConversation: (id, patch) =>
    set((prev) => ({
      conversation: prev.conversation.map((e) =>
        e.id === id ? { ...e, ...patch, pending: false } : e,
      ),
    })),
  clearConversation: () => set({ conversation: [] }),
  reset: () => set(INITIAL),
}));
