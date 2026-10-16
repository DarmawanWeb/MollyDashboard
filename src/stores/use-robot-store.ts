import { create } from "zustand";

import type {
  ConnectionStatus,
  FSMStateKey,
  RobotPose,
  RobotState,
} from "@/types";

interface RobotStore {
  state: RobotState;
  pose: RobotPose;

  fsmState: FSMStateKey;
  connectionStatus: ConnectionStatus;

  isEstop: boolean;

  setState: (state: Partial<RobotState>) => void;
  setPose: (pose: RobotPose) => void;

  setFSM: (fsmState: FSMStateKey) => void;
  setConnection: (status: ConnectionStatus) => void;

  toggleEstop: () => void;
}

const DEFAULT_STATE: RobotState = {
  battery_percentage: 78,
  cpu_temp: 42,
  gpu_temp: 38,

  gait_mode: "STANDARD",
  speed_mode: "MEDIUM",

  velocity: {
    linear: 0.35,
    angular: 0.02,
  },

  imu: {
    roll: 0.8,
    pitch: 1.2,
    yaw: 45.3,
  },

  uptime_seconds: 9257,

  cpu_usage: 34,
  gpu_usage: 21,

  ram_used_gb: 6.2,
  ram_total_gb: 16,
};

/**
 * Default pose puts the robot near origin (in meters, ROS map frame).
 * Mock grid is 6m × 5m centered at origin, so (0, 0) shows the robot in
 * the middle of the visible map.
 */
const DEFAULT_POSE: RobotPose = {
  x: 0,
  y: 0,
  yaw: 0,
};

/**
 * Global robot runtime state store.
 *
 * State and pose are kept as separate top-level fields rather than nesting
 * pose inside state. Reasoning:
 *   - pose updates at ~10Hz (every /odom message)
 *   - state updates at ~1Hz (battery, temps, system metrics)
 *
 * Putting them together would force any pose-only consumer (e.g. the map
 * canvas) to re-render on battery percentage changes. With separate fields,
 * Zustand's selector-based subscription handles them independently.
 */
export const useRobotStore = create<RobotStore>((set) => ({
  state: DEFAULT_STATE,
  pose: DEFAULT_POSE,

  fsmState: "IDLE",
  connectionStatus: "disconnected",

  isEstop: false,

  setState: (state) =>
    set((prev) => ({
      state: {
        ...prev.state,
        ...state,
      },
    })),

  setPose: (pose) => set({ pose }),

  setFSM: (fsmState) => set({ fsmState }),

  setConnection: (connectionStatus) => set({ connectionStatus }),

  toggleEstop: () =>
    set((prev) => {
      const next = !prev.isEstop;

      return {
        isEstop: next,
        fsmState: next ? "ESTOP" : "IDLE",
      };
    }),
}));
