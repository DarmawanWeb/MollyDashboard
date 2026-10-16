"use client";

import { Trash2 } from "lucide-react";
import { MollyButton } from "@/components/ui/molly/button";
import type { POI } from "@/types";

interface POIListItemProps {
  poi: POI;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Renders one POI as a clickable card with edit / delete actions.
 *
 * The outer container is a real button (full row keyboard-activatable) but
 * the edit/delete buttons stopPropagation so they don't trigger selection
 * on click.
 */
export function POIListItem({
  poi,
  index,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: POIListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`panel-inset px-2.5 py-2 cursor-pointer flex items-start justify-between gap-2 text-left transition-colors ${
        selected ? "border-cyan/40" : ""
      }`}
    >
      <div className="flex items-start gap-2 min-w-0">
        <span className="font-mono text-[10px] text-txt-muted w-4 shrink-0 pt-0.5">
          {index + 1}
        </span>
        <div className="min-w-0">
          <div className="text-xs text-txt-primary truncate">{poi.name}</div>
          {poi.description && (
            <div className="text-[10px] text-txt-muted truncate">
              {poi.description}
            </div>
          )}
          {poi.narrationText && (
            <div className="text-[10px] text-violet truncate">
              {poi.narrationText}
            </div>
          )}
          <div className="flex gap-2 mt-0.5">
            {poi.motionAction && poi.motionAction !== "none" && (
              <span className="label text-orange">{poi.motionAction}</span>
            )}
            <span className="label">{poi.dwellTimeSec}s dwell</span>
          </div>
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <MollyButton
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label={`Edit ${poi.name}`}
        >
          Edit
        </MollyButton>
        <MollyButton
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${poi.name}`}
        >
          <Trash2 size={11} />
        </MollyButton>
      </div>
    </button>
  );
}
