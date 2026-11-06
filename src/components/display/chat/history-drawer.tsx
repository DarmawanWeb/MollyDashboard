"use client";

import { History, Mic, Search, Sparkles, Volume2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DisplayCopy, DisplayLanguage } from "@/lib/display/copy";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/stores/use-conversation-store";
import type { ConversationEntry } from "@/types";
import { timeOf } from "./chat-message";

const LOCALE: Record<DisplayLanguage, string> = { id: "id-ID", en: "en-GB" };

function dayKey(at: number): string {
  const d = new Date(at);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(
  at: number,
  copy: DisplayCopy,
  language: DisplayLanguage,
): string {
  const key = dayKey(at);
  const now = Date.now();
  if (key === dayKey(now)) return copy.history.today;
  if (key === dayKey(now - 86_400_000)) return copy.history.yesterday;
  return new Intl.DateTimeFormat(LOCALE[language], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(at);
}

function Item({
  entry,
  copy,
  language,
}: {
  entry: ConversationEntry;
  copy: DisplayCopy;
  language: DisplayLanguage;
}) {
  return (
    <li className="rounded-2xl border border-border-subtle bg-mol-secondary p-4 shadow-card">
      <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold text-txt-muted">
        <span className="tabular-nums">{timeOf(entry.at, language)}</span>
        {entry.source === "robot" && (
          <span className="inline-flex items-center gap-1">
            <Mic className="size-3" />
            {copy.chat.inPerson}
          </span>
        )}
        {entry.engine === "llm" && (
          <span className="inline-flex items-center gap-1 text-violet">
            <Sparkles className="size-3" />
            AI
          </span>
        )}
        {entry.spoken && (
          <span className="inline-flex items-center gap-1">
            <Volume2 className="size-3" />
            {copy.chat.spoken}
          </span>
        )}
      </div>
      <p className="font-semibold leading-snug">{entry.question}</p>
      <p className="mt-1 text-sm leading-relaxed text-txt-secondary">
        {entry.answer}
      </p>
    </li>
  );
}

/**
 * Every conversation this screen knows (shared by all screens), grouped by
 * day, with a search. Slides in over the display; Esc or the backdrop
 * closes it.
 */
export function HistoryDrawer({
  open,
  onClose,
  copy,
  language,
}: {
  open: boolean;
  onClose: () => void;
  copy: DisplayCopy;
  language: DisplayLanguage;
}) {
  const entries = useConversationStore((s) => s.entries);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const shown = entries
      .filter((e) => !e.pending && e.ok)
      .filter(
        (e) =>
          !q ||
          e.question.toLowerCase().includes(q) ||
          e.answer.toLowerCase().includes(q),
      )
      .reverse();
    const byDay: { key: string; at: number; items: ConversationEntry[] }[] = [];
    for (const e of shown) {
      const key = dayKey(e.at);
      const group = byDay.at(-1);
      if (group?.key === key) group.items.push(e);
      else byDay.push({ key, at: e.at, items: [e] });
    }
    return byDay;
  }, [entries, query]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-[visibility] duration-300",
        open ? "visible" : "invisible",
      )}
      inert={!open}
    >
      <button
        type="button"
        aria-label={copy.history.close}
        tabIndex={-1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={copy.history.title}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-border-subtle bg-mol-root shadow-card-lg transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-brand/12 text-brand">
              <History className="size-4.5" />
            </span>
            <div>
              <h2 className="font-bold leading-tight">{copy.history.title}</h2>
              <p className="text-xs text-txt-tertiary">
                {copy.history.count(total)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.history.close}
            className="grid size-9 place-items-center rounded-full border border-border-subtle bg-mol-secondary text-txt-secondary hover:text-txt-primary"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="px-5 py-3">
          <label className="flex items-center gap-2 rounded-2xl border border-border bg-mol-secondary px-3.5 py-2.5 focus-within:border-brand">
            <Search className="size-4 text-txt-muted" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.history.search}
              className="w-full bg-transparent text-sm outline-none placeholder:text-txt-muted"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          {total === 0 ? (
            <p className="py-16 text-center text-sm text-txt-tertiary">
              {query ? copy.history.noMatch : copy.history.none}
            </p>
          ) : (
            groups.map((group) => (
              <section key={group.key} className="mb-5">
                <h3 className="sticky top-0 z-10 mb-2 bg-mol-root/95 py-1.5 text-xs font-bold uppercase tracking-wider text-txt-tertiary backdrop-blur">
                  {dayLabel(group.at, copy, language)}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {group.items.map((e) => (
                    <Item
                      key={e.id}
                      entry={e}
                      copy={copy}
                      language={language}
                    />
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
