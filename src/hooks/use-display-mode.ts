"use client";

import { env } from "@/lib/env";
import { useRobotStore } from "@/stores/use-robot-store";

/**
 * What the visitor display shows:
 *   live    a real robot is connected
 *   demo    the build runs on the in-memory robot (NEXT_PUBLIC_USE_MOCKS)
 *   offline the robot should be there but is not: show a resting state, not
 *           the mock robot the operator pages fall back to
 */
export type DisplayMode = "live" | "demo" | "offline";

export function useDisplayMode(): DisplayMode {
  const status = useRobotStore((s) => s.connectionStatus);
  if (env.USE_MOCKS) return "demo";
  return status === "connected" ? "live" : "offline";
}
