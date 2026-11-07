"use client";

import { useEffect, useState } from "react";
import type { DisplayMode } from "@/hooks/use-display-mode";
import type { DisplayCopy, DisplayLanguage } from "@/lib/display/copy";
import { cn } from "@/lib/utils";

const LOCALE: Record<DisplayLanguage, string> = { id: "id-ID", en: "en-GB" };

/** Wall clock with the date, in the display's language. */
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
      }).format(now)
    : "";

  return (
    <div className={cn("flex flex-col items-end leading-tight", className)}>
      <span
        className="text-[0.95rem] font-semibold tabular-nums tracking-tight"
        suppressHydrationWarning
      >
        {time.replace(".", ":")}
      </span>
      <span
        className="text-[0.68rem] text-txt-tertiary"
        suppressHydrationWarning
      >
        {date}
      </span>
    </div>
  );
}

const DOT: Record<DisplayMode, string> = {
  live: "bg-green",
  demo: "bg-amber",
  offline: "bg-txt-muted",
};

/** Online / Demo / Offline, in visitor words. */
export function StatusPill({
  mode,
  copy,
  className,
}: {
  mode: DisplayMode;
  copy: DisplayCopy;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-border-subtle bg-mol-secondary px-2.5 text-xs font-medium text-txt-secondary",
        className,
      )}
    >
      <span className="relative flex size-1.5">
        {mode === "live" && (
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full animate-ping-soft",
              DOT[mode],
            )}
          />
        )}
        <span className={cn("relative size-1.5 rounded-full", DOT[mode])} />
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
      className="inline-flex h-8 shrink-0 items-center rounded-lg bg-mol-tertiary p-0.5"
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
              "h-full rounded-md px-2.5 text-xs font-medium uppercase transition-colors",
              active
                ? "bg-mol-secondary text-txt-primary shadow-card ring-1 ring-border-subtle"
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
