/**
 * Frame helpers for drawing robot-relative data on the map.
 */

import type { RobotPose } from "@/types/ui";

/** A point in base_link (x forward, y left) to the map frame. */
export function baseToMap(
  pose: RobotPose,
  point: { x: number; y: number },
): { x: number; y: number } {
  const c = Math.cos(pose.yaw);
  const s = Math.sin(pose.yaw);
  return {
    x: pose.x + c * point.x - s * point.y,
    y: pose.y + s * point.x + c * point.y,
  };
}

/** Wrap an angle to (-π, π]. */
export function wrapAngle(a: number): number {
  let r = a;
  while (r > Math.PI) r -= 2 * Math.PI;
  while (r <= -Math.PI) r += 2 * Math.PI;
  return r;
}
