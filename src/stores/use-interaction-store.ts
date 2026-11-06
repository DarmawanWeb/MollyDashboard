import { create } from "zustand";

import type {
  GreeterSnapshot,
  SpeechSnapshot,
  VisitorsSnapshot,
} from "@/types";

interface InteractionStore {
  /** interaction/speech_status */
  speech: SpeechSnapshot;
  /** interaction/greeter, null until the greeter reports */
  greeter: GreeterSnapshot | null;
  /** perception/visitors */
  visitors: VisitorsSnapshot;

  setSpeech: (speech: SpeechSnapshot) => void;
  setGreeter: (greeter: GreeterSnapshot) => void;
  setVisitors: (visitors: VisitorsSnapshot) => void;
  /** Forget the robot-reported state. */
  reset: () => void;
}

/**
 * Visitor interaction: speech, greeter and who is around. Conversations
 * live in use-conversation-store.
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

  setSpeech: (speech) => set({ speech }),
  setGreeter: (greeter) => set({ greeter }),
  setVisitors: (visitors) => set({ visitors }),
  reset: () => set(INITIAL),
}));
