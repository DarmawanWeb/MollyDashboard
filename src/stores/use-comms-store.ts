import { create } from "zustand";
import type { LLMMessage } from "@/types";

interface CommsStore {
  messages: LLMMessage[];

  sttActive: boolean;
  teleopEnabled: boolean;

  addMessage: (message: LLMMessage) => void;
  toggleSTT: () => void;
  toggleTeleop: () => void;
}

/**
 * Dummy initial conversation
 */
const dummyMessages: LLMMessage[] = [
  {
    role: "system",
    text: "MOLLY system initialized successfully.",
    timestamp: "10:21:03",
  },
  {
    role: "operator",
    text: "Robot is now in standby mode.",
    timestamp: "10:21:10",
  },
  {
    role: "molly",
    text: "All systems nominal. Awaiting instructions.",
    timestamp: "10:21:12",
  },
  {
    role: "visitor",
    text: "Can you start the tour?",
    timestamp: "10:21:20",
  },
  {
    role: "operator",
    text: "Tour mode activated. Heading to Lobby Entrance.",
    timestamp: "10:21:30",
  },
  {
    role: "molly",
    text: "On my way to the Lobby Entrance. Estimated arrival in 2 minutes.",
    timestamp: "10:21:35",
  },
];

/**
 * Communication and teleop store.
 */
export const useCommsStore = create<CommsStore>((set) => ({
  messages: dummyMessages,

  sttActive: false,
  teleopEnabled: false,

  /**
   * Push new LLM conversation message.
   */
  addMessage: (message) =>
    set((prev) => ({
      messages: [...prev.messages, message],
    })),

  /**
   * Toggle speech-to-text mode.
   */
  toggleSTT: () =>
    set((prev) => ({
      sttActive: !prev.sttActive,
    })),

  /**
   * Toggle teleoperation state.
   */
  toggleTeleop: () =>
    set((prev) => ({
      teleopEnabled: !prev.teleopEnabled,
    })),
}));
