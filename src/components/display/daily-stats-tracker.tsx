"use client";

import { useEffect } from "react";
import type { DisplayMode } from "@/hooks/use-display-mode";
import { useDailyStatsStore } from "@/stores/use-daily-stats-store";
import { useRobotStore } from "@/stores/use-robot-store";
import { useTourStore } from "@/stores/use-tour-store";
import type { RobotPose } from "@/types";

/** Steps shorter than this are noise; longer ones are relocalization jumps. */
const MIN_STEP_M = 0.02;
const MAX_STEP_M = 1.0;

/**
 * Counts today's tours and meters walked for the display's tiles, from the
 * live robot (or the demo robot of a demo build), never from the mock the
 * pages fall back to while the robot is away.
 */
export function DailyStatsTracker({ mode }: { mode: DisplayMode }) {
  useEffect(() => {
    if (mode === "offline") return;
    let last: RobotPose | null = useRobotStore.getState().pose;

    const stopPose = useRobotStore.subscribe((s) => {
      const pose = s.pose;
      if (!pose || pose === last) return;
      if (last) {
        const step = Math.hypot(pose.x - last.x, pose.y - last.y);
        if (step < MIN_STEP_M) return; // wait until it adds up
        if (step <= MAX_STEP_M) useDailyStatsStore.getState().addDistance(step);
      }
      last = pose;
    });

    const stopTour = useTourStore.subscribe((s, prev) => {
      const started =
        s.state === "RUNNING" &&
        prev.state !== "RUNNING" &&
        prev.state !== "PAUSED";
      if (started) useDailyStatsStore.getState().addTour();
    });

    return () => {
      stopPose();
      stopTour();
    };
  }, [mode]);

  return null;
}
