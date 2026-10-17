"use client";

import { Trash2 } from "lucide-react";
import { MollyButton } from "@/components/ui/molly/button";
import { cn } from "@/lib/utils";
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
 * One POI as a card: the info area selects it (highlight on the map), the
 * edit / delete actions sit beside it (buttons never nest).
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
    <div
      className={cn(
        "panel-inset px-2.5 py-2 flex items-start justify-between gap-2 transition-colors",
        selected && "border-cyan/40",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex items-start gap-2 min-w-0 flex-1 text-left cursor-pointer"
      >
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
          {poi.narration && (
            <div className="text-[10px] text-violet truncate">
              {poi.narration}
            </div>
          )}
          <div className="flex gap-2 mt-0.5">
            {poi.gesture && (
              <span className="label text-orange">{poi.gesture}</span>
            )}
            <span className="label">{poi.dwellSec}s dwell</span>
            <span className="label">
              {poi.x.toFixed(1)}, {poi.y.toFixed(1)}
            </span>
          </div>
        </div>
      </button>
      <div className="flex gap-1 shrink-0">
        <MollyButton
          variant="ghost"
          size="sm"
          onClick={onEdit}
          aria-label={`Edit ${poi.name}`}
        >
          Edit
        </MollyButton>
        <MollyButton
          variant="danger"
          size="sm"
          onClick={onDelete}
          aria-label={`Delete ${poi.name}`}
        >
          <Trash2 size={11} />
        </MollyButton>
      </div>
    </div>
  );
}
