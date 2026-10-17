"use client";

import { env } from "@/lib/env";
import { useRobotStore } from "@/stores/use-robot-store";

/**
 * True when the dashboard talks to the in-memory robot instead of rosbridge:
 * the NEXT_PUBLIC_USE_MOCKS flag, or no rosbridge connection.
 */
export function useMockMode(): boolean {
  const status = useRobotStore((s) => s.connectionStatus);
  return env.USE_MOCKS || status === "disconnected";
}
