import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChatLanguage } from "@/types";

/** Visitor display preferences, per browser. */
interface DisplayStore {
  language: ChatLanguage;
  /** null: follow Settings (interaction.speakAnswers) */
  speak: boolean | null;
  setLanguage: (language: ChatLanguage) => void;
  setSpeak: (speak: boolean) => void;
}

export const useDisplayStore = create<DisplayStore>()(
  persist(
    (set) => ({
      language: "id",
      speak: null,
      setLanguage: (language) => set({ language }),
      setSpeak: (speak) => set({ speak }),
    }),
    {
      name: "molly-display",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
