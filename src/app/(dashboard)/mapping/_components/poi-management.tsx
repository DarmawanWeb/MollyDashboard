"use client";

import { LocateFixed, MapPin, Plus } from "lucide-react";
import { AppSection } from "@/components/layout/app/section";
import { MollyButton } from "@/components/ui/molly/button";
import { useSiteStore } from "@/stores/use-site-store";
import type { UsePoiEditorResult } from "../_hooks/use-poi-editor";
import { POIForm } from "./poi-form";
import { POIList } from "./poi-list";

interface POIManagementProps {
  editor: UsePoiEditorResult;
}

/**
 * Sidebar section: add (on the map or at the robot) → form → POI list.
 * The list is the robot's /site/pois of the active site.
 */
export function POIManagement({ editor }: POIManagementProps) {
  const pois = useSiteStore((s) => s.pois);
  const hasSite = useSiteStore((s) => s.status.site !== "");
  const busy = editor.placing || editor.draft !== null;

  return (
    <AppSection title="POIs" icon={<MapPin size={16} />}>
      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5">
          <MollyButton
            variant="ghost"
            onClick={editor.startAdd}
            disabled={!hasSite || busy}
            className="flex-1 justify-center gap-1.5"
          >
            <Plus size={13} />
            On map
          </MollyButton>
          <MollyButton
            variant="ghost"
            onClick={editor.startAddAtRobot}
            disabled={!hasSite || busy}
            className="flex-1 justify-center gap-1.5"
            title="New POI where the robot stands, facing its heading"
          >
            <LocateFixed size={13} />
            At robot
          </MollyButton>
        </div>

        {editor.draft && (
          <POIForm
            value={editor.draft}
            atRobotPose={editor.atRobotPose}
            saving={editor.saving}
            onChange={editor.update}
            onPickOnMap={editor.startMove}
            onSave={editor.save}
            onCancel={editor.cancel}
          />
        )}

        <POIList
          pois={pois}
          selectedId={editor.selectedId}
          onSelect={editor.toggleSelect}
          onEdit={editor.edit}
          onDelete={editor.remove}
        />
      </div>
    </AppSection>
  );
}
