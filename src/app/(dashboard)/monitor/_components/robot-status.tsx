"use client";

import { Activity, Battery, Gauge, Thermometer } from "lucide-react";
import { FSM_STATES } from "@/constants/fsm-states";
import { cn } from "@/lib/utils";
import { useRobotStore } from "@/stores/use-robot-store";

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="panel-inset px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span aria-hidden className="text-txt-muted">
          {icon}
        </span>
        <span
          className="label"
          id={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {label}
        </span>
      </div>
      <span className={cn("font-mono text-base font-bold", color)}>
        {value}
      </span>
    </div>
  );
}

export function RobotStatus() {
  const state = useRobotStore((s) => s.state);
  const fsmState = useRobotStore((s) => s.fsmState);

  const fsm = FSM_STATES[fsmState];

  const gaitModeStyle: Record<string, string> = {
    STANDAR: "text-blue-400",
    CRAWL: "text-orange-400",
    "H-STEP": "text-pink-400",
    STAIR: "text-purple-400",
  };

  const speedModeColor: Record<string, string> = {
    LOW: "#22c55e",
    MEDIUM: "#facc15",
    FAST: "#ef4444",
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 1. BATTERY + TEMP */}
      <div className="grid grid-cols-2 grid-rows-2 gap-1.5">
        <Stat
          icon={<Battery size={13} />}
          label="Battery"
          value={`${state.battery_percentage}%`}
          color={state.battery_percentage > 30 ? "#22c55e" : "#ef4444"}
        />

        <Stat
          icon={<Thermometer size={13} />}
          label="Temperature"
          value={`${state.cpu_temp}°C`}
          color={state.cpu_temp > 70 ? "#ef4444" : "#a0a0b0"}
        />

        <Stat
          icon={<Activity size={13} />}
          label="Speed Mode"
          value={state.speed_mode}
          color={speedModeColor[state.speed_mode]}
        />
        <Stat
          icon={<Activity size={13} />}
          label="Gait Mode"
          value={state.gait_mode}
          color={gaitModeStyle[state.gait_mode]}
        />
      </div>

      {/* 4. SPEED */}
      <div className="panel-inset px-3 py-2">
        <div className="flex items-center gap-1.5 mb-1">
          <Gauge size={13} aria-hidden className="text-txt-muted" />
          <span className="label" id="stat-speed">
            Speed
          </span>
        </div>

        <div className="font-mono text-base font-bold text-cyan-300">
          {state.velocity.linear.toFixed(2)} m/s
        </div>
      </div>

      {/* 5. FSM */}
      <div className="panel-inset px-3 py-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Activity size={13} aria-hidden className="text-txt-muted" />
          <span className="label" id="stat-fsm">
            FSM State
          </span>
        </div>

        <div
          aria-live="polite"
          className={cn(
            "flex items-center gap-2 border px-2.5 py-1 w-full",
            fsm.bgClass,
            fsm.borderClass,
          )}
        >
          <div
            aria-hidden
            className={cn(
              "h-2 w-2 motion-safe:animate-pulse-dot",
              fsm.dotClass,
            )}
          />
          <span
            className={cn("font-mono text-xs font-semibold", fsm.textClass)}
          >
            {fsm.label}
          </span>
        </div>
      </div>
    </div>
  );
}
