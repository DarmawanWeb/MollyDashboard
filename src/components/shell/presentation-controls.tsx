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
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-2.5 text-xs font-medium text-on-brand transition-[background-color,transform] hover:bg-brand-light active:scale-[0.98] @3xl:px-3",
        "presenting:hidden",
      )}
    >
      <Presentation className="size-3.5" />
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
        "relative hidden size-8 shrink-0 touch-none select-none place-items-center rounded-full text-txt-muted transition-colors hover:bg-mol-tertiary hover:text-txt-primary",
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
    <output className="pointer-events-none fixed bottom-14 left-1/2 z-50 animate-slide-up rounded-lg bg-txt-primary px-3.5 py-2 text-xs font-medium text-mol-root shadow-card-lg">
      {copy.present.hint}
    </output>
  );
}
