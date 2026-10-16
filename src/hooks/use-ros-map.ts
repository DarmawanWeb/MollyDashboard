"use client";
import { useEffect, useState } from "react";
import { getRos, TOPICS } from "@/lib/ros";
import { getMockOccupancyGrid } from "@/mocks/occupancy-grid";
import type { OccupancyGrid } from "@/types/ros";

/**
 * Subscribe to /map for live occupancy grid updates.
 *
 * When `useMock` is true (e.g. when rosbridge is disconnected), returns
 * a synthetic grid from src/mocks/occupancy-grid.ts instead.
 */
export function useOccupancyGrid(useMock = false): OccupancyGrid | null {
  const [grid, setGrid] = useState<OccupancyGrid | null>(
    useMock ? getMockOccupancyGrid() : null,
  );

  useEffect(() => {
    if (useMock) {
      setGrid(getMockOccupancyGrid());
      return;
    }
    const unsub = getRos().subscribe(TOPICS.MAP, setGrid);
    return unsub;
  }, [useMock]);

  return grid;
}
