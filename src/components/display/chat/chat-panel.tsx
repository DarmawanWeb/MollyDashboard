"use client";

import {
  History,
  Loader2,
  SendHorizontal,
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
import { ChatExchange, MollyAvatar, MollyLine } from "./chat-message";
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
      <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-border-subtle px-5 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <MollyAvatar className="size-8" />
          <div className="min-w-0 leading-tight">
            <h2 className="truncate text-[0.95rem] font-semibold tracking-tight">
              {copy.chat.title}
            </h2>
            <p className="truncate text-xs text-txt-tertiary">
              {copy.chat.subtitle}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setSpeak(!speak)}
            aria-pressed={speak}
            aria-label={speak ? copy.chat.speakOn : copy.chat.speakOff}
            title={speak ? copy.chat.speakOn : copy.chat.speakOff}
            className={cn(
              "grid size-8 place-items-center rounded-lg transition-colors hover:bg-mol-tertiary",
              speak ? "text-brand" : "text-txt-tertiary hover:text-txt-primary",
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
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-txt-secondary transition-colors hover:bg-mol-tertiary hover:text-txt-primary"
          >
            <History className="size-4" />
            {copy.chat.history}
          </button>
        </div>
      </header>

      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-5"
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

      <div className="shrink-0 px-4 pt-1 pb-4">
        {idle && available && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {copy.chat.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={busy}
                className="rounded-lg border border-border px-2.5 py-1.5 text-left text-[0.8rem] text-txt-secondary transition-colors hover:border-border-strong hover:bg-mol-tertiary hover:text-txt-primary disabled:opacity-50"
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
          className="flex items-center gap-2 rounded-xl border border-border bg-mol-secondary p-1.5 pl-3.5 transition-[border-color,box-shadow] focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/15"
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
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-on-brand transition-colors hover:bg-brand-light disabled:bg-mol-tertiary disabled:text-txt-muted"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizontal className="size-4" />
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
