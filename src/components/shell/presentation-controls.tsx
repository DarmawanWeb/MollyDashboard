"use client";

import { Minimize2, Presentation } from "lucide-react";
import { useEffect, useState } from "react";
import { useHoldToConfirm } from "@/hooks/use-hold-to-confirm";
import {
  enterPresentation,
  exitPresentation,
  usePresenting,
} from "@/hooks/use-presentation";
import type { DisplayCopy } from "@/lib/display/copy";
import { cn } from "@/lib/utils";

/** Hold this long to leave presentation mode (no accidental exits). */
const EXIT_HOLD_MS = 1200;
const RING = 2 * Math.PI * 16;

/** Start presentation mode: full screen, no operator chrome. */
export function PresentButton({ copy }: { copy: DisplayCopy }) {
  return (
    <button
      type="button"
      onClick={enterPresentation}
      title={copy.present.title}
      aria-label={copy.present.start}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-gradient-brand px-2.5 text-sm font-semibold text-on-brand shadow-card transition-[opacity,transform] hover:opacity-90 active:scale-95 @3xl:px-3.5",
        "presenting:hidden",
      )}
    >
      <Presentation className="size-4" />
      <span className="hidden @3xl:inline">{copy.present.start}</span>
    </button>
  );
}

/**
 * Leave presentation mode by holding the button: a ring fills while held,
 * so a visitor tapping the TV does not drop into the operator pages.
 */
export function ExitPresentationButton({ copy }: { copy: DisplayCopy }) {
  const hold = useHoldToConfirm(EXIT_HOLD_MS, exitPresentation);

  return (
    <button
      type="button"
      {...hold.handlers}
      title={copy.present.exit}
      aria-label={copy.present.exit}
      className={cn(
        "relative hidden size-9 shrink-0 touch-none select-none place-items-center rounded-full border border-border-subtle bg-mol-secondary/70 text-txt-muted transition-colors hover:text-txt-primary",
        "presenting:grid",
      )}
    >
      <svg
        aria-hidden
        role="presentation"
        viewBox="0 0 36 36"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${hold.progress * RING} ${RING}`}
        />
      </svg>
      <Minimize2 className="size-4" />
    </button>
  );
}

/** A short hint at the bottom when presentation mode starts. */
export function PresentationHint({ copy }: { copy: DisplayCopy }) {
  const presenting = usePresenting();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!presenting) {
      setShown(false);
      return;
    }
    setShown(true);
    const timer = setTimeout(() => setShown(false), 5000);
    return () => clearTimeout(timer);
  }, [presenting]);

  if (!shown) return null;

  return (
    <output className="pointer-events-none fixed bottom-14 left-1/2 z-50 animate-slide-up rounded-full border border-border-subtle bg-mol-secondary/90 px-4 py-2 text-sm font-semibold text-txt-secondary shadow-card-lg backdrop-blur">
      {copy.present.hint}
    </output>
  );
}
