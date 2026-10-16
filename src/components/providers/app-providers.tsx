"use client";

import type { ReactNode } from "react";
import { ConnectionProvider } from "./connection-provider";
import { SimulationLayer } from "./simulation-layer";
import { TourController } from "./tour-controller";

/**
 * Top-level provider composition for the dashboard.
 *
 * Ordering matters:
 *   ConnectionProvider       opens rosbridge, syncs status to store
 *     SimulationLayer        runs mocks when offline / USE_MOCKS
 *       TourController       subscribes /tour/state, owns command publish
 *         children           dashboard pages
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConnectionProvider>
      <SimulationLayer>
        <TourController>{children}</TourController>
      </SimulationLayer>
    </ConnectionProvider>
  );
}
