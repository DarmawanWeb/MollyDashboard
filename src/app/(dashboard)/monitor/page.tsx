"use client";
import {
  Camera,
  ChartNoAxesColumnIncreasing,
  MapIcon,
  MessageSquare,
  Radio,
} from "lucide-react";
import { AppSection } from "@/components/layout/app/section";
import { AppSidebar } from "@/components/layout/app/sidebar";
import { OccupancyCanvas } from "@/components/map/occupancy-canvas";
import { useOccupancyGrid } from "@/hooks/use-ros-map";
import { useRobotStore } from "@/stores/use-robot-store";
import { useTourStore } from "@/stores/use-tour-store";
import type { POI } from "@/types";
import { CameraFeed } from "./_components/camera-feed";
import { CommsPanel } from "./_components/comm-panel";
import { LLMPanel } from "./_components/llm-panel";
import { RobotStatus } from "./_components/robot-status";
import { TourControl } from "./_components/tour-control";

const MOCK_POIS: POI[] = [
  {
    id: "1",
    name: "Lobby",
    description: "Main entrance",
    x: 40,
    y: 30,
    orderIndex: 0,
    dwellTimeSec: 30,
    mapId: "mock",
  },
  {
    id: "2",
    name: "Hall A",
    description: "Modern art",
    x: 70,
    y: 50,
    orderIndex: 1,
    dwellTimeSec: 60,
    mapId: "mock",
  },
  {
    id: "3",
    name: "Hall B",
    description: "Historical",
    x: 95,
    y: 65,
    orderIndex: 2,
    dwellTimeSec: 45,
    mapId: "mock",
  },
  {
    id: "4",
    name: "Garden",
    description: "Outdoor",
    x: 80,
    y: 80,
    orderIndex: 3,
    dwellTimeSec: 40,
    mapId: "mock",
  },
  {
    id: "5",
    name: "Shop",
    description: "Souvenirs",
    x: 35,
    y: 70,
    orderIndex: 4,
    dwellTimeSec: 20,
    mapId: "mock",
  },
];

export default function MonitorPage() {
  const pose = useRobotStore((s) => s.pose);
  const connectionStatus = useRobotStore((s) => s.connectionStatus);
  const activePoiId = useTourStore((s) => s.activePoiId);
  const grid = useOccupancyGrid(connectionStatus === "disconnected");

  return (
    <div className="flex h-full w-full min-h-0">
      <AppSidebar side="left" width="w-[260px]">
        <AppSection title="Camera Feed" icon={<Camera size={16} />}>
          <CameraFeed label="RGB" />
          <CameraFeed label="Depth" />
        </AppSection>
        <AppSection
          title="Robot Status"
          icon={<ChartNoAxesColumnIncreasing size={16} />}
        >
          <RobotStatus />
        </AppSection>
      </AppSidebar>

      <div className="flex-1 p-3 min-w-0">
        <div className="panel w-full h-full relative overflow-hidden">
          {grid ? (
            <OccupancyCanvas
              grid={grid}
              pose={pose}
              pois={MOCK_POIS}
              activePoiId={activePoiId}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="label">Waiting for /map topic…</span>
            </div>
          )}
          <div className="absolute top-2 left-2 label">MAP CANVAS</div>
        </div>
      </div>

      <AppSidebar width="w-[300px]">
        <AppSection title="Tour Control" icon={<MapIcon size={16} />}>
          <TourControl pois={MOCK_POIS} />
        </AppSection>
        <AppSection
          title="LLM Conversation"
          icon={<MessageSquare size={16} />}
          className="flex flex-col h-60"
        >
          <LLMPanel />
        </AppSection>
        <AppSection title="Communications" icon={<Radio size={16} />}>
          <CommsPanel />
        </AppSection>
      </AppSidebar>
    </div>
  );
}
