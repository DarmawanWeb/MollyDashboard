"use client";

import { ACTIVITY_STATES } from "@/constants/activity-states";
import { useRobotActivity } from "@/hooks/use-robot-activity";
import { cn } from "@/lib/utils";

/** What the robot is doing right now: a colored dot and the state's name. */
export function ActivityBadge({ className }: { className?: string }) {
  const activity = ACTIVITY_STATES[useRobotActivity()];

  return (
    <div
      aria-live="polite"
      className={cn(
        "flex h-8 items-center gap-2 rounded-lg border border-border-subtle bg-mol-secondary px-2.5",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full motion-safe:animate-pulse-dot",
          activity.dotClass,
        )}
      />
      <span className="text-xs font-medium text-txt-secondary">
        {activity.label}
      </span>
    </div>
  );
}
