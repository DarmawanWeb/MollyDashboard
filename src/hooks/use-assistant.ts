"use client";

import { useRef } from "react";
import {
  AssistantError,
  saveConversation,
  streamAnswer,
  toStored,
} from "@/lib/conversation/api";
import { buildAssistantContext, recentTurns } from "@/lib/conversation/context";
import { newConversationId, plainText } from "@/lib/conversation/text";
import type { Story } from "@/lib/display/story";
import { useConversationStore } from "@/stores/use-conversation-store";
import { useInteractionStore } from "@/stores/use-interaction-store";
import { useRobotStore } from "@/stores/use-robot-store";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useSiteStore } from "@/stores/use-site-store";
import { useTourStore } from "@/stores/use-tour-store";
import type {
  AnswerEngine,
  AssistantContext,
  ChatLanguage,
  ConversationEntry,
  QuestionSource,
} from "@/types";
import { type DisplayMode, useDisplayMode } from "./use-display-mode";
import { useRobotApi } from "./use-robot-api";
import { useRobotStory } from "./use-robot-story";

export interface AskOptions {
  language: ChatLanguage;
  /** Molly says the answer out loud */
  speak: boolean;
}

/** Friendly failure texts; the technical reason goes to the console. */
const FAILED: Record<ChatLanguage, { busy: string; down: string }> = {
  id: {
    busy: "Banyak sekali pertanyaan barusan. Coba tanya lagi sebentar lagi, ya.",
    down: "Maaf, Molly belum bisa menjawab sekarang. Silakan coba lagi atau tanyakan ke petugas.",
  },
  en: {
    busy: "That was a lot of questions at once. Please try again in a moment.",
    down: "Sorry, Molly can't answer right now. Please try again or ask the staff.",
  },
};

function contextNow(story: Story, mode: DisplayMode): AssistantContext {
  if (mode === "offline") {
    // the stores hold the operator pages' mock fallback: tell the model nothing
    return {
      mode: "live",
      site: "",
      place: "",
      activity: "resting (not connected right now)",
      battery: null,
      visitorsNearby: 0,
      tour: null,
      places: [],
    };
  }
  const robot = useRobotStore.getState();
  const site = useSiteStore.getState();
  const tour = useTourStore.getState();
  const interaction = useInteractionStore.getState();
  return buildAssistantContext({
    demo: mode === "demo",
    site: site.status.site,
    story,
    battery: robot.battery?.percentage ?? null,
    visitorsNearby: interaction.visitors.count,
    pois: site.pois,
    tours: site.tours,
    tour: {
      state: tour.state,
      tourId: tour.tourId,
      tourName: tour.tourName,
      index: tour.currentPoiIndex,
      total: tour.totalPois,
      activePoiId: tour.activePoiId,
      activePoiName: tour.activePoiName,
    },
  });
}

/**
 * Ask Molly from a screen. The external LLM gateway answers when it is
 * configured (and chosen in Settings), with the live robot context in the
 * prompt; otherwise the robot's own conversation node does. Answers land in
 * the shared conversation history; Molly can say them out loud.
 */
export function useAssistant() {
  const api = useRobotApi();
  const mode = useDisplayMode();
  const story = useRobotStory();
  const status = useConversationStore((s) => s.status);
  const choice = useSettingsStore((s) => s.interaction.engine);
  const busy = useConversationStore((s) => s.entries.some((e) => e.pending));
  const inFlight = useRef(false);

  const engine: AnswerEngine =
    choice === "robot" || !status?.external ? "robot" : "llm";
  /** The robot answers only when it is there (offline: the mock would). */
  const available = engine === "llm" || mode !== "offline";

  /** Say the answer through the robot; every screen learns it was spoken. */
  const speakOut = async (
    id: string,
    answer: string,
    language: ChatLanguage,
  ) => {
    const text = plainText(answer);
    if (!text || mode === "offline") return;
    const res = await api.say(text, language, true);
    if (!res.success) return;
    const store = useConversationStore.getState();
    store.patch(id, { spoken: true, updatedAt: Date.now() });
    const entry = useConversationStore
      .getState()
      .entries.find((e) => e.id === id);
    if (entry) void saveConversation(toStored(entry));
  };

  const askLlm = async (entry: ConversationEntry, opts: AskOptions) => {
    const store = useConversationStore.getState();
    const started = performance.now();
    let answer = "";
    try {
      answer = await streamAnswer(
        {
          id: entry.id,
          question: entry.question,
          language: opts.language,
          context: contextNow(story, mode),
          history: recentTurns(store.entries.filter((e) => e.id !== entry.id)),
        },
        (piece) => {
          const current = useConversationStore
            .getState()
            .entries.find((e) => e.id === entry.id);
          useConversationStore
            .getState()
            .patch(entry.id, { answer: (current?.answer ?? "") + piece });
        },
      );
    } catch (err) {
      const rateLimited = err instanceof AssistantError && err.status === 429;
      console.warn("[assistant]", err);
      store.patch(entry.id, {
        pending: false,
        ok: false,
        answer: rateLimited
          ? FAILED[opts.language].busy
          : FAILED[opts.language].down,
        ms: Math.round(performance.now() - started),
        updatedAt: Date.now(),
      });
      return;
    }

    const clean = plainText(answer);
    store.patch(entry.id, {
      pending: false,
      ok: clean !== "",
      answer: clean || FAILED[opts.language].down,
      ms: Math.round(performance.now() - started),
      updatedAt: Date.now(),
    });
    if (clean && opts.speak) await speakOut(entry.id, clean, opts.language);
  };

  const askRobot = async (entry: ConversationEntry, opts: AskOptions) => {
    const store = useConversationStore.getState();
    const started = performance.now();
    const res = await api
      .ask(entry.question, opts.language, opts.speak)
      .catch((err: unknown) => ({
        success: false,
        message: String(err),
        answer: "",
      }));
    const ok = res.success && res.answer !== "";
    const done: ConversationEntry = {
      ...entry,
      pending: false,
      ok,
      answer: ok ? plainText(res.answer) : FAILED[opts.language].down,
      ms: Math.round(performance.now() - started),
      updatedAt: Date.now(),
      spoken: ok && opts.speak,
    };
    store.upsert(done);
    if (!ok) {
      console.warn("[assistant] robot:", res.message);
      return;
    }
    const canonical = await saveConversation(toStored(done));
    if (canonical) useConversationStore.getState().adopt(done.id, canonical);
  };

  const ask = async (question: string, opts: AskOptions): Promise<void> => {
    const q = question.trim();
    if (!q || inFlight.current || !available) return;
    inFlight.current = true;
    const now = Date.now();
    const entry: ConversationEntry = {
      id: newConversationId(),
      question: q,
      answer: "",
      ms: null,
      ok: true,
      pending: true,
      at: now,
      updatedAt: now,
      language: opts.language,
      engine,
      source: "screen" as QuestionSource,
      spoken: false,
    };
    useConversationStore.getState().upsert(entry);
    try {
      if (engine === "llm") await askLlm(entry, opts);
      else await askRobot(entry, opts);
    } finally {
      inFlight.current = false;
    }
  };

  return { ask, busy, engine, status, available };
}
