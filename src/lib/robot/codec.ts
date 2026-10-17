/**
 * Robot telemetry conversions: battery, IMU, Lite3 driver state, control mux
 * and localization status strings.
 */

import type { Lite3RobotStateWire } from "@/types/ros/lite3";
import type { BatteryState, Imu } from "@/types/ros/sensor";
import type {
  BatterySnapshot,
  ControlMode,
  Lite3Snapshot,
  LocalizationSnapshot,
  LocalizationSource,
  ProtectiveField,
  RobotImu,
} from "@/types/ui";
import { quaternionToEuler, radiansToDegrees } from "../ros/codec";

export function decodeBattery(msg: BatteryState): BatterySnapshot {
  const pct = Number.isFinite(msg.percentage) ? msg.percentage : Number.NaN;
  return {
    percentage: Math.round(Math.min(1, Math.max(0, pct)) * 100),
    voltage: Number.isFinite(msg.voltage) ? msg.voltage : Number.NaN,
    current: Number.isFinite(msg.current) ? msg.current : Number.NaN,
  };
}

export function decodeImu(msg: Imu): RobotImu {
  const { roll, pitch, yaw } = quaternionToEuler(msg.orientation);
  const r1 = (deg: number) => Math.round(deg * 10) / 10;
  return {
    roll: r1(radiansToDegrees(roll)),
    pitch: r1(radiansToDegrees(pitch)),
    yaw: r1(radiansToDegrees(yaw)),
  };
}

export function decodeLite3(w: Lite3RobotStateWire): Lite3Snapshot {
  return {
    connected: w.connected,
    ageSec: w.age_sec,
    basicState: w.basic_state_name || String(w.basic_state),
    gait: w.gait_name || String(w.gait_state),
    motion: w.motion_name || String(w.motion_state),
    standing: w.standing,
    moving: w.moving,
    balanceLost: w.balance_lost,
    ultrasoundFront: w.ultrasound_front,
    ultrasoundRear: w.ultrasound_rear,
    controlMode: w.control_mode,
    gesture: w.gesture,
  };
}

export function parseMode(raw: string): ControlMode {
  return raw.trim().toLowerCase() === "remote" ? "remote" : "auto";
}

const FIELDS: ReadonlyArray<ProtectiveField> = [
  "clear",
  "limited",
  "stop",
  "stale",
  "off",
];

export function parseField(raw: string): ProtectiveField {
  const v = raw.trim().toLowerCase();
  return (FIELDS as readonly string[]).includes(v)
    ? (v as ProtectiveField)
    : "unknown";
}

/** /localization/status: none, tag:<frame>, pose_estimate, origin. */
export function parseLocalization(raw: string): LocalizationSnapshot {
  const text = raw.trim();
  const [head, ...rest] = text.split(":");
  const known: Record<string, LocalizationSource> = {
    none: "none",
    tag: "tag",
    pose_estimate: "pose_estimate",
    origin: "origin",
  };
  const source = known[head] ?? (text ? "unknown" : "none");
  return {
    source,
    localized: source !== "none",
    detail: rest.join(":"),
    raw: text,
  };
}

export const NOT_LOCALIZED: LocalizationSnapshot = {
  source: "none",
  localized: false,
  detail: "",
  raw: "",
};
