"use client";

import { Bot, Gamepad2, Move } from "lucide-react";
import { AppSection } from "@/components/layout/app/section";
import { AppSidebar } from "@/components/layout/app/sidebar";
import { RobotMap } from "@/components/map/robot-map";
import { CameraFeed } from "@/components/robot";
import { DrivePad } from "./_components/drive-pad";
import { ModePanel } from "./_components/mode-panel";
import { RobotActions } from "./_components/robot-actions";

/**
 * Drive the robot by hand: the camera and the map in front of the
 * operator, AUTO / REMOTE, the hold-to-drive pad and the robot's own
 * commands on the side. Mapping a new site is driven from here.
 */
export default function ControlPage() {
  return (
    <div className="flex h-full w-full min-h-0">
      <div className="flex-1 min-w-0 p-3 flex flex-col gap-3">
        <CameraFeed label="Front" className="h-auto flex-3 min-h-0" />
        <RobotMap className="h-auto flex-2 min-h-0" />
      </div>

      <AppSidebar width="w-[320px]">
        <AppSection title="Mode" icon={<Gamepad2 size={16} />}>
          <ModePanel />
        </AppSection>
        <AppSection title="Drive" icon={<Move size={16} />}>
          <DrivePad />
        </AppSection>
        <AppSection title="Robot" icon={<Bot size={16} />}>
          <RobotActions />
        </AppSection>
      </AppSidebar>
    </div>
  );
}
