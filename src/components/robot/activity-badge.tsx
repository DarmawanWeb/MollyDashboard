"use client";

import { ACTIVITY_STATES } from "@/constants/activity-states";
import { useRobotActivity } from "@/hooks/use-robot-activity";
import { cn } from "@/lib/utils";

/** What the robot is doing right now, as a colored badge. */
export function ActivityBadge({ className }: { className?: string }) {
  const activity = ACTIVITY_STATES[useRobotActivity()];

  return (
    <div
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 border px-2.5 py-1",
        activity.bgClass,
        activity.borderClass,
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "h-2 w-2 motion-safe:animate-pulse-dot",
          activity.dotClass,
        )}
      />
      <span
        className={cn("font-mono text-xs font-semibold", activity.textClass)}
      >
        {activity.label}
      </span>
    </div>
  );
}
