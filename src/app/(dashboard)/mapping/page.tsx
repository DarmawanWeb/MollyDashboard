"use client";

import { X } from "lucide-react";
import { AppSidebar } from "@/components/layout/app/sidebar";
import { OccupancyCanvas } from "@/components/map/occupancy-canvas";
import { useOccupancyGrid } from "@/hooks/use-ros-map";
import { useRobotStore } from "@/stores/use-robot-store";
import { POIManagement } from "./_components/poi-management";
import { SavedMaps } from "./_components/saved-maps";
import { SlamControl } from "./_components/slam-control";
import { usePoiEditor } from "./_hooks/use-poi-editor";

export default function MappingPage() {
  const connectionStatus = useRobotStore((s) => s.connectionStatus);
  const pose = useRobotStore((s) => s.pose);
  const grid = useOccupancyGrid(connectionStatus === "disconnected");
  const editor = usePoiEditor();

  return (
    <div className="flex h-full w-full min-h-0">
      <div className="flex-1 p-3 min-w-0 relative">
        <div className="panel w-full h-full relative overflow-hidden">
          {grid ? (
            <OccupancyCanvas
              grid={grid}
              pose={pose}
              pois={editor.pois}
              activePoiId={editor.selectedId}
              showPoiLabels
              onMapClick={
                editor.addMode
                  ? (world) => editor.placeAt(world, grid)
                  : undefined
              }
              onPoiClick={(poi) => editor.toggleSelect(poi.id)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="label">
                No map data — start SLAM or connect ROS
              </span>
            </div>
          )}

          {editor.addMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-cyan text-mol-root font-mono text-xs font-bold px-4 py-2">
              CLICK ON MAP TO PLACE POI
              <button
                title="Cancel"
                type="button"
                onClick={editor.cancelAdd}
                className="ml-3 opacity-60 hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="absolute bottom-3 right-3 label">
            {grid
              ? `${grid.info.width}×${grid.info.height} @ ${grid.info.resolution}m/cell`
              : ""}
          </div>
        </div>
      </div>

      <AppSidebar width="w-[360px]">
        <SlamControl />
        <POIManagement editor={editor} />
        <SavedMaps />
      </AppSidebar>
    </div>
  );
}
