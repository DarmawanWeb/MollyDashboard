"use client";
import {
  Camera,
  ChartNoAxesColumnIncreasing,
  MapIcon,
  Navigation,
} from "lucide-react";
import { AppSection } from "@/components/layout/app/section";
import { AppSidebar } from "@/components/layout/app/sidebar";
import { RobotMap } from "@/components/map/robot-map";
import { CameraFeed } from "./_components/camera-feed";
import { GoToPanel } from "./_components/go-to-panel";
import { RobotStatus } from "./_components/robot-status";
import { TourControl } from "./_components/tour-control";

export default function MonitorPage() {
  return (
    <div className="flex h-full w-full min-h-0">
      <AppSidebar side="left" width="w-[280px]">
        <AppSection title="Camera" icon={<Camera size={16} />}>
          <CameraFeed label="Front" />
        </AppSection>
        <AppSection
          title="Robot Status"
          icon={<ChartNoAxesColumnIncreasing size={16} />}
        >
          <RobotStatus />
        </AppSection>
      </AppSidebar>

      <div className="flex-1 p-3 min-w-0">
        <RobotMap />
      </div>

      <AppSidebar width="w-[320px]">
        <AppSection title="Tour Control" icon={<MapIcon size={16} />}>
          <TourControl />
        </AppSection>
        <AppSection title="Walk To" icon={<Navigation size={16} />}>
          <GoToPanel />
        </AppSection>
      </AppSidebar>
    </div>
  );
}
