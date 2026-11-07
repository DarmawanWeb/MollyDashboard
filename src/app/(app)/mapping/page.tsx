"use client";

import { X } from "lucide-react";
import { AppSidebar } from "@/components/layout/app/sidebar";
import { RobotMap } from "@/components/map/robot-map";
import { LocalizationPanel } from "./_components/localization-panel";
import { MappingPanel } from "./_components/mapping-panel";
import { POIManagement } from "./_components/poi-management";
import { SitePanel } from "./_components/site-panel";
import { TourManagement } from "./_components/tour-management";
import { usePoiEditor } from "./_hooks/use-poi-editor";
import { useTourEditor } from "./_hooks/use-tour-editor";

export default function MappingPage() {
  const editor = usePoiEditor();
  const tours = useTourEditor();

  return (
    <div className="flex h-full w-full min-h-0">
      <div className="flex-1 p-3 min-w-0 relative">
        <RobotMap
          showPoiLabels
          showVisitors={false}
          selectedPoiId={editor.selectedId}
          route={tours.route}
          placement={{
            active: editor.placing,
            defaultYaw: editor.draft?.yaw ?? 0,
            onPlace: editor.place,
          }}
          onPoiClick={(poi) => editor.toggleSelect(poi.id)}
        />

        {editor.placing && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-cyan text-mol-root font-mono text-xs font-bold px-4 py-2 flex items-center">
            CLICK TO PLACE · DRAG TO SET HEADING
            <button
              title="Cancel"
              type="button"
              onClick={editor.cancelPlacement}
              className="ml-3 opacity-60 hover:opacity-100"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      <AppSidebar width="w-[360px]">
        <SitePanel />
        <MappingPanel />
        <LocalizationPanel />
        <POIManagement editor={editor} />
        <TourManagement editor={tours} />
      </AppSidebar>
    </div>
  );
}
