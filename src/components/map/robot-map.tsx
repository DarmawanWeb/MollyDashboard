"use client";

import { useMemo } from "react";
import { useMockMode } from "@/hooks/use-mock-mode";
import { useOccupancyGrid } from "@/hooks/use-ros-map";
import { baseToMap } from "@/lib/map/frames";
import { isWalking } from "@/lib/navigation/codec";
import { cn } from "@/lib/utils";
import { useInteractionStore } from "@/stores/use-interaction-store";
import { useNavigationStore } from "@/stores/use-navigation-store";
import { useRobotStore } from "@/stores/use-robot-store";
import { useSiteStore } from "@/stores/use-site-store";
import { useTourStore } from "@/stores/use-tour-store";
import type { POI } from "@/types";
import { type MapPlacement, OccupancyCanvas } from "./occupancy-canvas";

interface RobotMapProps {
  /** Draw the planned path and the goal */
  showPath?: boolean;
  /** Draw visitors around the robot */
  showVisitors?: boolean;
  showPoiLabels?: boolean;
  selectedPoiId?: string | null;
  placement?: MapPlacement;
  onPoiClick?: (poi: POI) => void;
  className?: string;
}

/**
 * The occupancy canvas wired to the robot: /map (or the mock grid offline),
 * pose, the site's POIs, the planned path and goal, and visitors (base_link
 * → map with the current pose). Plus a status strip with the site and map.
 */
export function RobotMap({
  showPath = true,
  showVisitors = true,
  showPoiLabels = false,
  selectedPoiId = null,
  placement,
  onPoiClick,
  className,
}: RobotMapProps) {
  const mock = useMockMode();
  const grid = useOccupancyGrid(mock);
  const pose = useRobotStore((s) => s.pose);
  const pois = useSiteStore((s) => s.pois);
  const site = useSiteStore((s) => s.status.site);
  const mapping = useSiteStore((s) => s.mapping.active);
  const planner = useNavigationStore((s) => s.planner);
  const path = useNavigationStore((s) => s.path);
  const visitors = useInteractionStore((s) => s.visitors.positions);
  const tourPoi = useTourStore((s) =>
    s.state === "RUNNING" || s.state === "PAUSED" ? s.activePoiId : null,
  );

  const walking = isWalking(planner.state);
  const activePoiId = tourPoi ?? (walking ? planner.goalId || null : null);

  const visitorsOnMap = useMemo(
    () =>
      pose && showVisitors
        ? visitors.map((v) => ({
            ...baseToMap(pose, v),
            confidence: v.confidence,
          }))
        : [],
    [pose, visitors, showVisitors],
  );

  return (
    <div
      className={cn("panel w-full h-full relative overflow-hidden", className)}
    >
      <OccupancyCanvas
        grid={grid}
        pose={pose}
        pois={pois}
        activePoiId={activePoiId}
        selectedPoiId={selectedPoiId}
        showPoiLabels={showPoiLabels}
        path={showPath && walking ? path : []}
        goal={showPath && walking ? planner.goal : null}
        visitors={visitorsOnMap}
        placement={placement}
        onPoiClick={onPoiClick}
      />

      <div className="absolute bottom-3 right-3 flex items-center gap-2 font-mono text-[10px] text-txt-muted pointer-events-none">
        {mapping && <span className="text-blue-300">● mapping</span>}
        <span>{site ? `site ${site}` : "no site loaded"}</span>
        {grid && (
          <span>
            {grid.info.width}×{grid.info.height} @ {grid.info.resolution}m
          </span>
        )}
      </div>
    </div>
  );
}
