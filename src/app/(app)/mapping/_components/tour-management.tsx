"use client";

import { Plus, Route } from "lucide-react";
import { AppSection } from "@/components/layout/app/section";
import { MollyButton } from "@/components/ui/molly";
import { useSiteStore } from "@/stores/use-site-store";
import type { UseTourEditorResult } from "../_hooks/use-tour-editor";
import { TourForm } from "./tour-form";
import { TourList } from "./tour-list";

interface TourManagementProps {
  editor: UseTourEditorResult;
}

/**
 * Sidebar section: new tour → form → tour list. The list is the robot's
 * /site/tours of the active site; the monitor page runs them.
 */
export function TourManagement({ editor }: TourManagementProps) {
  const tours = useSiteStore((s) => s.tours);
  const pois = useSiteStore((s) => s.pois);
  const hasSite = useSiteStore((s) => s.status.site !== "");

  return (
    <AppSection title="Tours" icon={<Route size={16} />}>
      <div className="flex flex-col gap-2">
        <MollyButton
          variant="ghost"
          onClick={editor.startNew}
          disabled={!hasSite || pois.length === 0 || editor.draft !== null}
          className="justify-center gap-1.5"
          title={pois.length === 0 ? "Add POIs first" : undefined}
        >
          <Plus size={13} />
          New tour
        </MollyButton>

        {editor.draft && (
          <TourForm
            value={editor.draft}
            pois={pois}
            saving={editor.saving}
            onChange={editor.update}
            onAddStop={editor.addStop}
            onMoveStop={editor.moveStop}
            onRemoveStop={editor.removeStop}
            onSave={editor.save}
            onCancel={editor.cancel}
          />
        )}

        <TourList
          tours={tours}
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
