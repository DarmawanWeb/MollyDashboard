/**
 * Robot telemetry, control and localization types (UI side).
 */

/** 2D pose in the map frame (yaw in radians, position in meters). */
export interface RobotPose {
  x: number;
  y: number;
  yaw: number;
}

/** IMU attitude in degrees (for human-readable display). */
export interface RobotImu {
  roll: number;
  pitch: number;
  yaw: number;
}

export interface BatterySnapshot {
  /** 0..100 */
  percentage: number;
  /** V, NaN when unknown */
  voltage: number;
  /** A, NaN when unknown */
  current: number;
}

/** Deep Robotics Lite3 driver state (lite3_interfaces/msg/RobotState). */
export interface Lite3Snapshot {
  connected: boolean;
  ageSec: number;
  basicState: string;
  gait: string;
  motion: string;
  standing: boolean;
  moving: boolean;
  balanceLost: boolean;
  /** m, 0.28..4.5 */
  ultrasoundFront: number;
  ultrasoundRear: number;
  controlMode: string;
  gesture: string;
}

export type ControlMode = "auto" | "remote";

/** State of the control mux protective field. */
export type ProtectiveField =
  | "clear"
  | "limited"
  | "stop"
  | "stale"
  | "off"
  | "unknown";

/** Who drives, and whether the software e-stop holds the robot. */
export interface ControlSnapshot {
  mode: ControlMode;
  estopEngaged: boolean;
  estopReason: string;
  field: ProtectiveField;
}

export type LocalizationSource =
  | "none"
  | "tag"
  | "pose_estimate"
  | "origin"
  | "unknown";

/** Parsed /localization/status, e.g. "tag:tag_3". */
export interface LocalizationSnapshot {
  source: LocalizationSource;
  localized: boolean;
  /** Tag frame when source === "tag" */
  detail: string;
  raw: string;
}
