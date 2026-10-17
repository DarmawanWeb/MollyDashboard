"use client";

import type { ReactNode } from "react";
import { useMockMode } from "@/hooks/use-mock-mode";
import { useMockSync } from "@/hooks/use-mock-sync";

/**
 * Runs the in-memory robot so the dashboard has believable data when
 * rosbridge is unreachable or in pure dev mode (env.USE_MOCKS).
 *
 * Stops (and clears every store) as soon as a real robot is connected.
 */
export function SimulationLayer({ children }: { children: ReactNode }) {
  useMockSync(useMockMode());
  return <>{children}</>;
}
