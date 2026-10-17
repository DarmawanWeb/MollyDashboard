import { create } from "zustand";

import type {
  BatterySnapshot,
  ConnectionStatus,
  ControlSnapshot,
  Lite3Snapshot,
  LocalizationSnapshot,
  RobotImu,
  RobotPose,
} from "@/types";

interface RobotStore {
  connectionStatus: ConnectionStatus;
  /**
   * Increments whenever the rosbridge client is rebuilt (new URL or robot
   * namespace) so subscription hooks re-subscribe on the new client.
   */
  rosEpoch: number;

  /** map → base_link from /localization/pose, null until localized */
  pose: RobotPose | null;
  localization: LocalizationSnapshot;
  /** /odometry/status: initializing, ok, degraded: …, lost: … */
  odometry: string;

  battery: BatterySnapshot | null;
  imu: RobotImu | null;
  /** Lite3 driver state, null on other robots or before the first message */
  lite3: Lite3Snapshot | null;

  /** Control mux: mode, e-stop, protective field */
  control: ControlSnapshot;

  setConnection: (status: ConnectionStatus) => void;
  bumpRosEpoch: () => void;
  setPose: (pose: RobotPose | null) => void;
  setLocalization: (localization: LocalizationSnapshot) => void;
  setOdometry: (odometry: string) => void;
  setBattery: (battery: BatterySnapshot) => void;
  setImu: (imu: RobotImu) => void;
  setLite3: (lite3: Lite3Snapshot) => void;
  setControl: (patch: Partial<ControlSnapshot>) => void;
  /** Forget everything the robot (or the mock) reported. */
  resetTelemetry: () => void;
}

const DEFAULT_CONTROL: ControlSnapshot = {
  mode: "auto",
  estopEngaged: false,
  estopReason: "",
  field: "unknown",
};

const NOT_LOCALIZED: LocalizationSnapshot = {
  source: "none",
  localized: false,
  detail: "",
  raw: "",
};

/**
 * Robot telemetry, localization and control state.
 *
 * Pose lives in its own top-level field: it updates at ~10 Hz while the
 * rest changes at ~1 Hz, and Zustand selectors keep pose-only consumers
 * (the map canvas) from re-rendering on battery changes and vice versa.
 */
const TELEMETRY_DEFAULTS = {
  pose: null,
  localization: NOT_LOCALIZED,
  odometry: "",
  battery: null,
  imu: null,
  lite3: null,
  control: DEFAULT_CONTROL,
};

export const useRobotStore = create<RobotStore>((set) => ({
  connectionStatus: "disconnected",
  rosEpoch: 0,
  ...TELEMETRY_DEFAULTS,

  setConnection: (connectionStatus) => set({ connectionStatus }),
  bumpRosEpoch: () => set((prev) => ({ rosEpoch: prev.rosEpoch + 1 })),
  setPose: (pose) => set({ pose }),
  setLocalization: (localization) => set({ localization }),
  setOdometry: (odometry) => set({ odometry }),
  setBattery: (battery) => set({ battery }),
  setImu: (imu) => set({ imu }),
  setLite3: (lite3) => set({ lite3 }),
  setControl: (patch) =>
    set((prev) => ({ control: { ...prev.control, ...patch } })),
  resetTelemetry: () => set(TELEMETRY_DEFAULTS),
}));
