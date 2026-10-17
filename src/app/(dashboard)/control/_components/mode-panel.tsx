"use client";

import { Battery, Bot, Gamepad2, Radar } from "lucide-react";
import { Stat } from "@/components/robot";
import { MollyButton } from "@/components/ui/molly";
import { useRobotAction } from "@/hooks/use-robot-action";
import { useRobotApi } from "@/hooks/use-robot-api";
import { useRobotStore } from "@/stores/use-robot-store";
import type { ControlMode, ProtectiveField } from "@/types";

const MODES: ReadonlyArray<{
  mode: ControlMode;
  label: string;
  icon: typeof Bot;
}> = [
  { mode: "auto", label: "Auto", icon: Bot },
  { mode: "remote", label: "Remote", icon: Gamepad2 },
];

const FIELD_TONE: Record<ProtectiveField, string> = {
  clear: "text-green",
  limited: "text-amber",
  stop: "text-red",
  stale: "text-red",
  off: "text-txt-tertiary",
  unknown: "text-txt-muted",
};

/**
 * Who drives (/bridge/set_mode): AUTO lets the planner and the tour walk
 * the robot, REMOTE hands it to teleop (this page or the handheld). Shows
 * the mux's protective field and the battery next to it.
 */
export function ModePanel() {
  const api = useRobotApi();
  const { run, busy } = useRobotAction();
  const mode = useRobotStore((s) => s.control.mode);
  const field = useRobotStore((s) => s.control.field);
  const battery = useRobotStore((s) => s.battery?.percentage);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-1.5">
        {MODES.map(({ mode: m, label, icon: Icon }) => (
          <MollyButton
            key={m}
            variant={mode === m ? "primary" : "ghost"}
            aria-pressed={mode === m}
            disabled={busy !== null}
            onClick={() => {
              if (mode !== m) {
                void run("mode", `Switch to ${label}`, () => api.setMode(m));
              }
            }}
          >
            <Icon size={14} />
            {label}
          </MollyButton>
        ))}
      </div>
      <p className="text-[10px] font-mono text-txt-muted">
        {mode === "remote"
          ? "Teleop drives; tours and walks wait."
          : "Tours and walks drive; teleop is ignored."}
      </p>

      <div className="grid grid-cols-2 gap-1.5">
        <Stat
          icon={<Radar size={13} />}
          label="Field"
          value={field}
          tone={FIELD_TONE[field]}
        />
        <Stat
          icon={<Battery size={13} />}
          label="Battery"
          value={battery === undefined ? "—" : `${battery}%`}
          tone={
            battery === undefined
              ? "text-txt-muted"
              : battery > 30
                ? "text-green"
                : "text-red"
          }
        />
      </div>
    </div>
  );
}
