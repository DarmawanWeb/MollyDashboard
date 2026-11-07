"use client";

import { useEffect, useState } from "react";
import type { DisplayMode } from "@/hooks/use-display-mode";
import type { DisplayCopy, DisplayLanguage } from "@/lib/display/copy";
import { cn } from "@/lib/utils";

const LOCALE: Record<DisplayLanguage, string> = { id: "id-ID", en: "en-GB" };

/** Big wall clock with the date, in the display's language. */
export function LiveClock({
  language,
  className,
}: {
  language: DisplayLanguage;
  className?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = now
    ? new Intl.DateTimeFormat(LOCALE[language], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now)
    : "--:--";
  const date = now
    ? new Intl.DateTimeFormat(LOCALE[language], {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now)
    : "";

  return (
    <div className={cn("flex flex-col items-end leading-none", className)}>
      <span
        className="font-bold text-xl tabular-nums tracking-tight"
        suppressHydrationWarning
      >
        {time.replace(".", ":")}
      </span>
      <span
        className="mt-0.5 text-[0.65rem] font-medium text-txt-tertiary"
        suppressHydrationWarning
      >
        {date}
      </span>
    </div>
  );
}

const PILL: Record<DisplayMode, { dot: string; text: string; ring: string }> = {
  live: {
    dot: "bg-green",
    text: "text-green",
    ring: "border-green/30 bg-green/10",
  },
  demo: {
    dot: "bg-amber",
    text: "text-amber",
    ring: "border-amber/30 bg-amber/10",
  },
  offline: {
    dot: "bg-txt-muted",
    text: "text-txt-tertiary",
    ring: "border-border bg-mol-tertiary",
  },
};

/** Online / Demo / Offline, in visitor words. */
export function StatusPill({
  mode,
  copy,
}: {
  mode: DisplayMode;
  copy: DisplayCopy;
}) {
  const style = PILL[mode];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold",
        style.ring,
        style.text,
      )}
    >
      <span className="relative flex size-2">
        {mode !== "offline" && (
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full animate-ping-soft",
              style.dot,
            )}
          />
        )}
        <span className={cn("relative size-2 rounded-full", style.dot)} />
      </span>
      {copy.status[mode]}
    </span>
  );
}

/** ID | EN */
export function LanguageToggle({
  language,
  onChange,
  label,
}: {
  language: DisplayLanguage;
  onChange: (language: DisplayLanguage) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-full border border-border-subtle bg-mol-secondary p-0.5"
    >
      {(["id", "en"] as const).map((value) => {
        const active = language === value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: a styled segmented control, not a native radio
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(value)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-bold uppercase transition-colors",
              active
                ? "bg-gradient-brand text-on-brand shadow-card"
                : "text-txt-tertiary hover:text-txt-primary",
            )}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
