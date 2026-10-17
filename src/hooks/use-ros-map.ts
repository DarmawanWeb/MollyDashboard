"use client";
import { useEffect, useState } from "react";
import { getRos, TOPICS } from "@/lib/ros";
import { getMockOccupancyGrid } from "@/mocks/occupancy-grid";
import { useRobotStore } from "@/stores/use-robot-store";
import type { OccupancyGrid } from "@/types/ros";

/** /map can be several MB; one update per second is plenty for display. */
const MAP_THROTTLE_MS = 1000;

/**
 * Subscribe to /map (latched: the site map, or the live grid while mapping).
 *
 * When `useMock` is true (USE_MOCKS or rosbridge disconnected), returns a
 * synthetic grid from src/mocks/occupancy-grid.ts instead.
 */
export function useOccupancyGrid(useMock = false): OccupancyGrid | null {
  const [grid, setGrid] = useState<OccupancyGrid | null>(
    useMock ? getMockOccupancyGrid() : null,
  );
  const epoch = useRobotStore((s) => s.rosEpoch);

  useEffect(() => {
    if (useMock) {
      setGrid(getMockOccupancyGrid());
      return;
    }
    void epoch; // re-subscribe on a rebuilt client
    setGrid(null);
    return getRos().subscribe(TOPICS.MAP, setGrid, {
      throttleMs: MAP_THROTTLE_MS,
    });
  }, [useMock, epoch]);

  return grid;
}
