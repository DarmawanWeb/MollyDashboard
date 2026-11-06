"use client";

import {
  History,
  Loader2,
  SendHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAssistant } from "@/hooks/use-assistant";
import type { DisplayCopy, DisplayLanguage } from "@/lib/display/copy";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/stores/use-conversation-store";
import { useDisplayStore } from "@/stores/use-display-store";
import { useSettingsStore } from "@/stores/use-settings-store";
import { ChatExchange, MollyLine } from "./chat-message";
import { HistoryDrawer } from "./history-drawer";

/** Exchanges shown in the chat; the drawer has the rest. */
const SHOWN = 30;
/** After this long without questions the suggestions come back. */
const IDLE_MS = 3 * 60_000;

/**
 * "Ask Molly": visitors type a question (or tap a suggestion) and Molly
 * answers in the chat, out loud if enabled. Questions asked to the robot in
 * person show up here too. The history drawer has every conversation.
 */
export function ChatPanel({
  copy,
  language,
  className,
}: {
  copy: DisplayCopy;
  language: DisplayLanguage;
  className?: string;
}) {
  const { ask, busy, available } = useAssistant();
  const entries = useConversationStore((s) => s.entries);
  const speakSetting = useSettingsStore((s) => s.interaction.speakAnswers);
  const speakChoice = useDisplayStore((s) => s.speak);
  const setSpeak = useDisplayStore((s) => s.setSpeak);
  const speak = speakChoice ?? speakSetting;

  const [question, setQuestion] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // a slow clock, so the suggestions come back after a quiet spell
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const shown = entries.slice(-SHOWN);
  const last = shown.at(-1);
  const idle = !last || now - last.at > IDLE_MS;

  // follow the newest message, also while an answer streams in
  useEffect(() => {
    void last?.answer;
    const el = listRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [last?.answer, last]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || busy || !available) return;
    setQuestion("");
    void ask(q, { language, speak });
  };

  return (
    <section
      className={cn(
        "display-card flex min-h-[28rem] min-w-0 flex-col overflow-hidden",
        className,
      )}
      aria-label={copy.chat.title}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-on-brand shadow-card">
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-extrabold leading-tight tracking-tight">
              {copy.chat.title}
            </h2>
            <p className="truncate text-xs text-txt-tertiary">
              {copy.chat.subtitle}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSpeak(!speak)}
            aria-pressed={speak}
            aria-label={speak ? copy.chat.speakOn : copy.chat.speakOff}
            title={speak ? copy.chat.speakOn : copy.chat.speakOff}
            className={cn(
              "grid size-9 place-items-center rounded-full border transition-colors",
              speak
                ? "border-brand/30 bg-brand/10 text-brand"
                : "border-border-subtle bg-mol-secondary text-txt-tertiary",
            )}
          >
            {speak ? (
              <Volume2 className="size-4" />
            ) : (
              <VolumeX className="size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-subtle bg-mol-secondary px-3 text-xs font-semibold text-txt-secondary transition-colors hover:text-txt-primary"
          >
            <History className="size-4" />
            {copy.chat.history}
          </button>
        </div>
      </header>

      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
        aria-live="polite"
      >
        <MollyLine>{copy.chat.welcome}</MollyLine>
        {shown.map((entry) => (
          <ChatExchange
            key={entry.id}
            entry={entry}
            copy={copy}
            language={language}
          />
        ))}
        {!available && <MollyLine>{copy.chat.resting}</MollyLine>}
      </div>

      <div className="shrink-0 border-t border-border-subtle bg-mol-secondary/60 px-4 pt-3 pb-4">
        {idle && available && (
          <div className="mb-3 flex flex-wrap gap-2">
            {copy.chat.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={busy}
                className="rounded-full border border-brand/25 bg-brand/8 px-3 py-1.5 text-left text-[0.8rem] font-semibold text-brand transition-colors hover:bg-brand/15 disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(question);
          }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-mol-secondary p-1.5 pl-4 shadow-card transition-colors focus-within:border-brand"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={available ? copy.chat.placeholder : copy.chat.resting}
            aria-label={copy.chat.placeholder}
            maxLength={500}
            disabled={!available}
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent py-2 text-[0.95rem] outline-none placeholder:text-txt-muted disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!question.trim() || busy || !available}
            aria-label={copy.chat.send}
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-brand text-on-brand shadow-card transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <SendHorizontal className="size-5" />
            )}
          </button>
        </form>
      </div>

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        copy={copy}
        language={language}
      />
    </section>
  );
}
