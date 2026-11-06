import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Local calendar day, e.g. "2026-11-06". */
export function today(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

interface DailyStatsStore {
  /** Day the counters belong to */
  day: string;
  toursStarted: number;
  /** Meters walked */
  distanceM: number;
  addTour: () => void;
  addDistance: (meters: number) => void;
}

function fresh(day: string) {
  return { day, toursStarted: 0, distanceM: 0 };
}

/**
 * Today's counters on the visitor display (tours started, distance walked),
 * saved per browser and reset at midnight.
 */
export const useDailyStatsStore = create<DailyStatsStore>()(
  persist(
    (set) => ({
      ...fresh(today()),
      addTour: () =>
        set((s) => {
          const day = today();
          const base = s.day === day ? s : fresh(day);
          return { ...base, toursStarted: base.toursStarted + 1 };
        }),
      addDistance: (meters) =>
        set((s) => {
          const day = today();
          const base = s.day === day ? s : fresh(day);
          return { ...base, distanceM: base.distanceM + meters };
        }),
    }),
    {
      name: "molly-daily-stats",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
