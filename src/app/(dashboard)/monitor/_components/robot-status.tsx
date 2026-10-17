"use client";

import {
  Battery,
  Footprints,
  Gauge,
  LocateFixed,
  Radar,
  Shield,
  SlidersHorizontal,
} from "lucide-react";
import { ActivityBadge, Stat } from "@/components/robot";
import { useRobotStore } from "@/stores/use-robot-store";
import type { LocalizationSnapshot, ProtectiveField } from "@/types";

const FIELD_TONE: Record<ProtectiveField, string> = {
  clear: "text-green",
  limited: "text-amber",
  stop: "text-red",
  stale: "text-red",
  off: "text-txt-tertiary",
  unknown: "text-txt-muted",
};

function localizationText(l: LocalizationSnapshot): string {
  switch (l.source) {
    case "tag":
      return l.detail ? `tag ${l.detail}` : "tag";
    case "pose_estimate":
      return "pose estimate";
    case "origin":
      return "map origin";
    case "none":
      return "not localized";
    default:
      return l.raw || "unknown";
  }
}

function meters(v: number | undefined): string {
  return v === undefined || !Number.isFinite(v) ? "—" : `${v.toFixed(2)} m`;
}

/**
 * Robot status: activity, battery, localization, control mux, Lite3 driver
 * state and attitude. Values the robot has not reported show a dash.
 */
export function RobotStatus() {
  const battery = useRobotStore((s) => s.battery);
  const localization = useRobotStore((s) => s.localization);
  const control = useRobotStore((s) => s.control);
  const odometry = useRobotStore((s) => s.odometry);
  const lite3 = useRobotStore((s) => s.lite3);
  const imu = useRobotStore((s) => s.imu);

  const batteryPct = battery?.percentage;

  return (
    <div className="flex flex-col gap-2">
      <ActivityBadge />

      <div className="grid grid-cols-2 gap-1.5">
        <Stat
          icon={<Battery size={13} />}
          label="Battery"
          value={batteryPct === undefined ? "—" : `${batteryPct}%`}
          tone={
            batteryPct === undefined
              ? "text-txt-muted"
              : batteryPct > 30
                ? "text-green"
                : "text-red"
          }
          hint={
            battery && Number.isFinite(battery.voltage)
              ? `${battery.voltage.toFixed(1)} V`
              : undefined
          }
        />
        <Stat
          icon={<LocateFixed size={13} />}
          label="Localization"
          value={localizationText(localization)}
          tone={localization.localized ? "text-cyan" : "text-amber"}
        />
        <Stat
          icon={<SlidersHorizontal size={13} />}
          label="Mode"
          value={control.mode.toUpperCase()}
          tone={control.mode === "remote" ? "text-amber" : "text-txt-primary"}
        />
        <Stat
          icon={<Shield size={13} />}
          label="Field"
          value={control.field}
          tone={FIELD_TONE[control.field]}
        />
      </div>

      {lite3 && (
        <div className="grid grid-cols-2 gap-1.5">
          <Stat
            icon={<Footprints size={13} />}
            label="Posture"
            value={
              lite3.gesture ? `gesture ${lite3.gesture}` : lite3.basicState
            }
            tone={lite3.connected ? undefined : "text-red"}
            hint={lite3.connected ? undefined : "no state from the motion host"}
          />
          <Stat icon={<Gauge size={13} />} label="Gait" value={lite3.gait} />
          <Stat
            icon={<Radar size={13} />}
            label="Sonar front"
            value={meters(lite3.ultrasoundFront)}
          />
          <Stat
            icon={<Radar size={13} />}
            label="Sonar rear"
            value={meters(lite3.ultrasoundRear)}
          />
        </div>
      )}

      <div className="panel-inset px-3 py-2 flex items-center justify-between">
        <span className="label">Attitude</span>
        <span className="font-mono text-xs text-txt-secondary">
          {imu ? `roll ${imu.roll}° · pitch ${imu.pitch}°` : "—"}
        </span>
      </div>

      <div className="panel-inset px-3 py-2 flex items-center justify-between gap-2">
        <span className="label">Odometry</span>
        <span
          className={`font-mono text-xs truncate ${
            odometry.startsWith("ok")
              ? "text-green"
              : odometry
                ? "text-amber"
                : "text-txt-muted"
          }`}
          title={odometry}
        >
          {odometry || "—"}
        </span>
      </div>
    </div>
  );
}
