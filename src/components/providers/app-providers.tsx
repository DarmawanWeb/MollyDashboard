"use client";

import type { ReactNode } from "react";
import { ConnectionProvider } from "./connection-provider";
import { RosSyncLayer } from "./ros-sync-layer";
import { SimulationLayer } from "./simulation-layer";
import { TourController } from "./tour-controller";

/**
 * Top-level provider composition for the dashboard.
 *
 * Ordering matters:
 *   ConnectionProvider       opens rosbridge, syncs status to store
 *     SimulationLayer        in-memory robot when offline / USE_MOCKS
 *       RosSyncLayer         robot topics → stores when connected
 *         TourController     subscribes /tour/state, owns tour commands
 *           children         dashboard pages
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConnectionProvider>
      <SimulationLayer>
        <RosSyncLayer>
          <TourController>{children}</TourController>
        </RosSyncLayer>
      </SimulationLayer>
    </ConnectionProvider>
  );
}
