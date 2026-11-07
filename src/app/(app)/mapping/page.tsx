"use client";

import { MousePointerClick, X } from "lucide-react";
import { AppSidebar } from "@/components/layout/app/sidebar";
import { RobotMap } from "@/components/map/robot-map";
import { LocalizationPanel } from "./_components/localization-panel";
import { MappingPanel } from "./_components/mapping-panel";
import { POIManagement } from "./_components/poi-management";
import { SitePanel } from "./_components/site-panel";
import { TourManagement } from "./_components/tour-management";
import { usePoiEditor } from "./_hooks/use-poi-editor";
import { useTourEditor } from "./_hooks/use-tour-editor";

/**
 * Sites, mapping, localization and the POI / tour editors next to the map.
 * Wide: map and a scrolling column of cards; narrow: the map first.
 */
export default function MappingPage() {
  const editor = usePoiEditor();
  const tours = useTourEditor();

  return (
    <div className="@container flex min-h-0 flex-1 flex-col overflow-y-auto @5xl:overflow-hidden">
      <div className="grid grid-cols-1 gap-3 p-3 lg:gap-4 lg:p-4 @5xl:min-h-0 @5xl:flex-1 @5xl:grid-cols-[minmax(0,1fr)_23rem] @5xl:grid-rows-[minmax(0,1fr)]">
        <div className="relative h-[60vh] min-h-[22rem] @5xl:h-auto @5xl:min-h-0">
          <RobotMap
            className="rounded-xl"
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
            <div className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-txt-primary py-1.5 pr-1.5 pl-3 text-xs font-medium text-mol-root shadow-card-lg">
              <MousePointerClick className="size-3.5" />
              Click to place · drag to set the heading
              <button
                title="Cancel"
                aria-label="Cancel placing"
                type="button"
                onClick={editor.cancelPlacement}
                className="grid size-6 place-items-center rounded-md text-mol-root/70 hover:bg-mol-root/15 hover:text-mol-root"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>

        <AppSidebar>
          <SitePanel />
          <MappingPanel />
          <LocalizationPanel />
          <POIManagement editor={editor} />
          <TourManagement editor={tours} />
        </AppSidebar>
      </div>
    </div>
  );
}
