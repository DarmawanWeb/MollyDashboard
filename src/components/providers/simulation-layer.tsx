"use client";

import type { ReactNode } from "react";
import { useFSMSimulation, useRobotSimulation } from "@/hooks/use-ros";
import { useTelemetrySimulation } from "@/hooks/use-telemetry-simulation";
import { env } from "@/lib/env";
import { useRobotStore } from "@/stores/use-robot-store";
import { useTourStore } from "@/stores/use-tour-store";

/**
 * Runs synthetic telemetry, motion, and FSM cycling so the dashboard has
 * believable data when rosbridge is unreachable or when running in pure
 * dev mode (env.USE_MOCKS).
 *
 * Each simulator is a no-op when its `active` flag is false, so the hooks
 * can stay mounted unconditionally and toggle cleanly when connection
 * comes back online.
 */
export function SimulationLayer({ children }: { children: ReactNode }) {
  const connectionStatus = useRobotStore((s) => s.connectionStatus);
  const isEstop = useRobotStore((s) => s.isEstop);
  const tourActive = useTourStore((s) => s.active);

  // Simulate when:
  //   - explicit USE_MOCKS flag, OR
  //   - we're disconnected from rosbridge AND not in e-stop
  const offline = connectionStatus === "disconnected" && !isEstop;
  const shouldSimulate = env.USE_MOCKS || offline;

  // Telemetry runs continuously while simulating — visitors expect to see
  // *something* moving even before a tour starts.
  useTelemetrySimulation(shouldSimulate);

  // Motion + FSM are tour-driven; only animate when a tour is active.
  useRobotSimulation(shouldSimulate && tourActive);
  useFSMSimulation(shouldSimulate && tourActive);

  return <>{children}</>;
}
