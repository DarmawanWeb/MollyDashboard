"use client";

import { OctagonX } from "lucide-react";
import type { KeyboardEvent, PointerEvent } from "react";
import { useHoldToConfirm } from "@/hooks/use-hold-to-confirm";
import { useRobotApi } from "@/hooks/use-robot-api";
import { cn } from "@/lib/utils";
import { useRobotStore } from "@/stores/use-robot-store";
import { toast } from "@/stores/use-toast-store";

const RELEASE_HOLD_MS = 1000;

/**
 * Software e-stop (/bridge/estop): pressing engages it at once; releasing
 * needs a one-second hold so it never happens by accident. The robot's
 * latched /bridge/estop_engaged decides what the button shows.
 *
 * Engaging fires on press, not on click: the button turns back into the
 * engage button while the release hold is still down, and the click that
 * follows the hold must not engage it again.
 */
export function EstopButton() {
  const api = useRobotApi();
  const engaged = useRobotStore((s) => s.control.estopEngaged);
  const reason = useRobotStore((s) => s.control.estopReason);

  const engage = async () => {
    const res = await api.setEstop(true);
    if (!res.success) toast.error("E-stop failed", res.message);
  };

  const release = useHoldToConfirm(RELEASE_HOLD_MS, async () => {
    const res = await api.setEstop(false);
    if (res.success) {
      toast.info("E-stop released", "Resume the tour or the walk explicitly");
    } else {
      toast.error("E-stop release failed", res.message);
    }
  });

  if (!engaged) {
    return (
      <button
        type="button"
        onPointerDown={(e: PointerEvent) => {
          if (e.button === 0) void engage();
        }}
        onKeyDown={(e: KeyboardEvent) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat) {
            e.preventDefault();
            void engage();
          }
        }}
        className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-red/25 bg-red/8 px-2.5 text-xs font-semibold tracking-wide text-red transition-[background-color,transform] select-none hover:bg-red/15 active:scale-[0.98]"
      >
        <OctagonX size={13} />
        E-STOP
      </button>
    );
  }

  return (
    <button
      type="button"
      {...release.handlers}
      title={reason ? `Engaged: ${reason}` : "Engaged"}
      className={cn(
        "relative flex h-8 shrink-0 items-center gap-1.5 overflow-hidden rounded-lg border px-2.5 text-xs font-semibold tracking-wide select-none touch-none",
        "border-red bg-red text-white",
        release.progress === 0 && "motion-safe:animate-pulse",
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-white/30"
        style={{ width: `${release.progress * 100}%` }}
      />
      <OctagonX size={13} className="relative" />
      <span className="relative">
        E-STOP<span className="hidden @xl:inline"> · hold to release</span>
      </span>
    </button>
  );
}
