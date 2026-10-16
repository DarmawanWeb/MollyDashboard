"use client";

import { useEffect, useRef, useState } from "react";
import type { RobotPose } from "@/types/ui";

const MIN_STEP_METERS = 0.05; // only record when robot moves >5cm
const MAX_TRAIL_LENGTH = 120;

export interface TrailPoint {
  x: number;
  y: number;
}

/**
 * Tracks the robot's recent path as a fixed-length ring of world points.
 *
 * Only appends when the robot has moved more than MIN_STEP_METERS from the
 * last recorded point — otherwise stationary robots would fill the buffer
 * with duplicates and skew the fade gradient.
 *
 * Returns a frozen array reference each time it grows so renderers can
 * cheaply detect changes via referential equality.
 */
export function useRobotTrail(
  pose: RobotPose | null,
): ReadonlyArray<TrailPoint> {
  const [trail, setTrail] = useState<ReadonlyArray<TrailPoint>>([]);
  const lastRef = useRef<TrailPoint | null>(null);

  useEffect(() => {
    if (!pose) return;
    const last = lastRef.current;

    if (last) {
      const dx = pose.x - last.x;
      const dy = pose.y - last.y;
      if (Math.hypot(dx, dy) < MIN_STEP_METERS) return;
    }

    const next: TrailPoint = { x: pose.x, y: pose.y };
    lastRef.current = next;

    setTrail((prev) => {
      const grown = [...prev, next];
      if (grown.length > MAX_TRAIL_LENGTH) {
        grown.splice(0, grown.length - MAX_TRAIL_LENGTH);
      }
      return grown;
    });
  }, [pose]);

  return trail;
}
