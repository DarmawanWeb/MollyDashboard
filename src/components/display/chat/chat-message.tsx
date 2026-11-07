"use client";

import { Info, Mic, PawPrint, Volume2 } from "lucide-react";
import { streamingText } from "@/lib/conversation/text";
import type { DisplayCopy, DisplayLanguage } from "@/lib/display/copy";
import { cn } from "@/lib/utils";
import type { ConversationEntry } from "@/types";

const LOCALE: Record<DisplayLanguage, string> = { id: "id-ID", en: "en-GB" };

export function timeOf(at: number, language: DisplayLanguage): string {
  return new Intl.DateTimeFormat(LOCALE[language], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(at)
    .replace(".", ":");
}

/** Molly in the chat: her paw on a quiet tile. */
export function MollyAvatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full bg-brand/10 text-brand",
        className,
      )}
    >
      <PawPrint className="size-[55%]" />
    </span>
  );
}

export function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-txt-tertiary animate-dots"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  );
}

/** Molly's own line (welcome, notices). */
export function MollyLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex animate-rise-in items-end gap-2">
      <MollyAvatar />
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-mol-tertiary px-3.5 py-2.5 text-[0.92rem] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

/** One question and its answer, as chat bubbles. */
export function ChatExchange({
  entry,
  copy,
  language,
}: {
  entry: ConversationEntry;
  copy: DisplayCopy;
  language: DisplayLanguage;
}) {
  const inPerson = entry.source === "robot";
  return (
    <div className="flex animate-rise-in flex-col gap-2">
      <div className="flex flex-col items-end gap-1">
        <span className="flex items-center gap-1 px-1 text-[0.68rem] text-txt-muted">
          {inPerson && <Mic className="size-3" />}
          {inPerson ? copy.chat.inPerson : copy.chat.you} ·{" "}
          {timeOf(entry.at, language)}
        </span>
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand px-3.5 py-2.5 text-[0.92rem] leading-relaxed text-on-brand">
          {entry.question}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <MollyAvatar />
        <div className="flex min-w-0 max-w-[85%] flex-col gap-1">
          <div
            className={cn(
              "rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-[0.92rem] leading-relaxed",
              entry.ok ? "bg-mol-tertiary" : "bg-amber/10 text-txt-secondary",
            )}
          >
            {entry.pending && !entry.answer ? (
              <span className="flex items-center gap-2 text-sm text-txt-tertiary">
                <TypingDots />
                {copy.chat.thinking}
              </span>
            ) : (
              <span className="whitespace-pre-wrap">
                {!entry.ok && (
                  <Info className="mr-1.5 inline size-4 align-[-3px] text-amber" />
                )}
                {entry.pending ? streamingText(entry.answer) : entry.answer}
                {entry.pending && (
                  <span
                    aria-hidden
                    className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-pulse-dot bg-brand"
                  />
                )}
              </span>
            )}
          </div>
          {!entry.pending && entry.ok && entry.spoken && (
            <span className="flex items-center gap-1 px-1 text-[0.68rem] text-txt-muted">
              <Volume2 className="size-3" />
              {copy.chat.spoken}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
