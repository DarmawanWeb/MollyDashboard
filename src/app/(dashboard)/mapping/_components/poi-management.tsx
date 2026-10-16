"use client";

import { MapPin, Plus } from "lucide-react";
import { AppSection } from "@/components/layout/app/section";
import { MollyButton } from "@/components/ui/molly/button";
import type { UsePoiEditorResult } from "../_hooks/use-poi-editor";
import { POIForm } from "./poi-form";
import { POIList } from "./poi-list";

interface POIManagementProps {
  editor: UsePoiEditorResult;
}

/**
 * Sidebar section: add button → optional form → POI list.
 *
 * Mode (create / edit) is inferred from whether editingId is set —
 * if not editing, we're creating a new POI from the pending coord.
 */
export function POIManagement({ editor }: POIManagementProps) {
  return (
    <AppSection title="POI Management" icon={<MapPin size={16} />}>
      <div className="flex flex-col gap-2">
        <MollyButton
          variant="ghost"
          onClick={editor.startAdd}
          disabled={editor.addMode || editor.isFormOpen}
          className="w-full justify-center gap-1.5"
        >
          <Plus size={13} />
          Click map to add POI
        </MollyButton>

        {editor.isFormOpen && (
          <POIForm
            mode={editor.editingId ? "edit" : "create"}
            value={editor.form}
            onChange={editor.setForm}
            onSave={editor.saveForm}
            onCancel={editor.cancelForm}
          />
        )}

        <POIList
          pois={editor.pois}
          selectedId={editor.selectedId}
          onSelect={editor.toggleSelect}
          onEdit={editor.editPoi}
          onDelete={editor.deletePoi}
        />
      </div>
    </AppSection>
  );
}
