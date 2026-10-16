"use client";

import {
  ArrowDown,
  ArrowUp,
  Gamepad2,
  RotateCcw,
  RotateCw,
  Square,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  MollyButton,
  MollyField,
  MollyNumberInput,
} from "@/components/ui/molly";
import { useSettingsStore } from "@/stores/use-settings-store";
import { type TeleopDirection, useTeleopHold } from "../_hooks/use-teleop-hold";
import { SettingsSection } from "./settings-section";

export function TeleopSection() {
  const { linearVel, angularVel } = useSettingsStore((s) => s.teleop);
  const setTeleop = useSettingsStore((s) => s.setTeleop);

  const { held, startHold, publishStop } = useTeleopHold({
    linearVel,
    angularVel,
  });

  return (
    <SettingsSection icon={<Gamepad2 size={18} />} title="Teleop Control">
      <div className="flex flex-col gap-3">
        {/* Velocity inputs */}
        <div className="grid grid-cols-2 gap-3">
          <MollyField label="Linear vel (m/s)" htmlFor="linear-vel">
            <MollyNumberInput
              id="linear-vel"
              value={linearVel}
              onChange={(v) => setTeleop({ linearVel: v })}
              min={0.05}
              max={1.5}
              step={0.05}
              precision={2}
              title="Linear velocity in meters per second"
            />
          </MollyField>

          <MollyField label="Angular vel (rad/s)" htmlFor="angular-vel">
            <MollyNumberInput
              id="angular-vel"
              value={angularVel}
              onChange={(v) => setTeleop({ angularVel: v })}
              min={0.1}
              max={2.0}
              step={0.1}
              precision={1}
              title="Angular velocity in radians per second"
            />
          </MollyField>
        </div>

        {/* D-pad */}
        <div className="flex flex-col items-center gap-1 mt-1">
          <TeleopBtn
            held={held}
            dir="fwd"
            startHold={startHold}
            icon={<ArrowUp size={16} />}
            label="Move forward"
          />

          <div className="flex gap-1">
            <TeleopBtn
              held={held}
              dir="left"
              startHold={startHold}
              icon={<RotateCcw size={16} />}
              label="Rotate left"
            />

            <MollyButton
              variant="danger"
              size="lg"
              onMouseDown={publishStop}
              onTouchStart={publishStop}
              aria-label="Stop"
              title="Stop"
            >
              <Square size={16} />
            </MollyButton>

            <TeleopBtn
              held={held}
              dir="right"
              startHold={startHold}
              icon={<RotateCw size={16} />}
              label="Rotate right"
            />
          </div>

          <TeleopBtn
            held={held}
            dir="back"
            startHold={startHold}
            icon={<ArrowDown size={16} />}
            label="Move backward"
          />
        </div>

        <p className="text-[10px] text-txt-muted text-center">
          Hold button to move · release to stop
        </p>
      </div>
    </SettingsSection>
  );
}

/* ----------------------------------------------------------------------------
 * Local presentational component
 * ------------------------------------------------------------------------- */

interface TeleopBtnProps {
  held: TeleopDirection | null;
  dir: TeleopDirection;
  startHold: (d: TeleopDirection) => void;
  icon: ReactNode;
  label: string;
}

function TeleopBtn({ held, dir, startHold, icon, label }: TeleopBtnProps) {
  const isHeld = held === dir;
  return (
    <MollyButton
      variant={isHeld ? "primary" : "ghost"}
      size="lg"
      onMouseDown={() => startHold(dir)}
      onTouchStart={() => startHold(dir)}
      aria-label={label}
      title={label}
    >
      {icon}
    </MollyButton>
  );
}
