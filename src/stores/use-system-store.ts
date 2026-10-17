import { create } from "zustand";

import type { HealthSnapshot, LogEntry } from "@/types";

const MAX_LOGS = 2000;

interface SystemStore {
  /** /health/status, null until the health monitor reports */
  health: HealthSnapshot | null;
  /** /rosout entries, oldest first, capped at MAX_LOGS */
  logs: LogEntry[];

  setHealth: (health: HealthSnapshot) => void;
  appendLogs: (entries: LogEntry[]) => void;
  clearLogs: () => void;
  reset: () => void;
}

/**
 * Computer health and the robot's log stream.
 */
export const useSystemStore = create<SystemStore>((set) => ({
  health: null,
  logs: [],

  setHealth: (health) => set({ health }),
  appendLogs: (entries) =>
    set((prev) => ({ logs: [...prev.logs, ...entries].slice(-MAX_LOGS) })),
  clearLogs: () => set({ logs: [] }),
  reset: () => set({ health: null, logs: [] }),
}));
