"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Octagon,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { MollyButton } from "@/components/ui/molly";
import { useRobotApi } from "@/hooks/use-robot-api";
import { type TeleopDirection, useTeleop } from "@/hooks/use-teleop";
import { cn } from "@/lib/utils";
import { useRobotStore } from "@/stores/use-robot-store";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useKeyboardDrive } from "../_hooks/use-keyboard-drive";

interface PadKey {
  direction: TeleopDirection;
  icon: ReactNode;
  label: string;
  keys: string;
}

/** 3 × 3 pad, row by row; null cells are the stop button. */
const PAD: ReadonlyArray<PadKey | null> = [
  {
    direction: "turn_left",
    icon: <RotateCcw size={18} />,
    label: "Turn left",
    keys: "Q / ←",
  },
  {
    direction: "forward",
    icon: <ArrowUp size={18} />,
    label: "Forward",
    keys: "W / ↑",
  },
  {
    direction: "turn_right",
    icon: <RotateCw size={18} />,
    label: "Turn right",
    keys: "E / →",
  },
  {
    direction: "left",
    icon: <ArrowLeft size={18} />,
    label: "Step left",
    keys: "A",
  },
  null,
  {
    direction: "right",
    icon: <ArrowRight size={18} />,
    label: "Step right",
    keys: "D",
  },
];

const BACKWARD: PadKey = {
  direction: "backward",
  icon: <ArrowDown size={18} />,
  label: "Backward",
  keys: "S / ↓",
};

/**
 * Hold-to-drive pad (/bridge/remote_cmd_vel at 10 Hz while held, zero on
 * release), with the same moves on the keyboard. Works in REMOTE mode only;
 * the control mux ignores teleop in AUTO.
 */
export function DrivePad() {
  const api = useRobotApi();
  const limits = useSettingsStore((s) => s.teleop);
  const mode = useRobotStore((s) => s.control.mode);
  const estop = useRobotStore((s) => s.control.estopEngaged);
  const teleop = useTeleop(api, limits);

  const enabled = mode === "remote" && !estop;
  useKeyboardDrive(enabled, teleop.startHold, teleop.release);

  // leaving REMOTE or an e-stop ends a hold that is still down
  const { release } = teleop;
  useEffect(() => {
    if (!enabled) release();
  }, [enabled, release]);

  const key = (k: PadKey) => (
    <MollyButton
      key={k.direction}
      variant="secondary"
      disabled={!enabled}
      aria-label={`${k.label} (${k.keys})`}
      aria-pressed={teleop.held === k.direction}
      title={`${k.label} · ${k.keys}`}
      onPointerDown={(e) => {
        if (e.button === 0) teleop.startHold(k.direction);
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "h-14 touch-none select-none",
        teleop.held === k.direction && "bg-cyan text-mol-root border-cyan",
      )}
    >
      {k.icon}
    </MollyButton>
  );

  return (
    <div className="flex flex-col gap-2">
      {!enabled && (
        <div className="text-[10px] text-amber border-l-2 border-amber px-2 py-1 bg-amber/5">
          {estop
            ? "E-stop engaged — release it to drive."
            : "AUTO mode — switch to REMOTE to drive."}
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5">
        {PAD.map((k) =>
          k ? (
            key(k)
          ) : (
            <MollyButton
              key="stop"
              variant="danger"
              disabled={!enabled}
              aria-label="Stop driving"
              title="Stop driving"
              onClick={() => {
                teleop.release();
                teleop.stop();
              }}
              className="h-14"
            >
              <Octagon size={18} />
            </MollyButton>
          ),
        )}
        <span />
        {key(BACKWARD)}
        <span />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 font-mono text-[10px] text-txt-muted">
        <span>
          {limits.linearVel.toFixed(2)} m/s · {limits.lateralVel.toFixed(2)} m/s
          · {limits.angularVel.toFixed(2)} rad/s
        </span>
        <span>WASD · QE · arrows</span>
      </div>
    </div>
  );
}
