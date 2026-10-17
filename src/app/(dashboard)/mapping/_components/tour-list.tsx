"use client";

import { Trash2 } from "lucide-react";
import { MollyButton, MollyConfirmButton } from "@/components/ui/molly";
import { cn } from "@/lib/utils";
import type { POI, TourDefinition } from "@/types";

interface TourListProps {
  tours: TourDefinition[];
  pois: POI[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (tour: TourDefinition) => void;
  onDelete: (tour: TourDefinition) => void;
}

/**
 * The site's tours. Selecting one draws its route on the map; edit and
 * delete sit beside the info area (buttons never nest).
 */
export function TourList({
  tours,
  pois,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: TourListProps) {
  if (tours.length === 0) {
    return (
      <div className="text-[10px] text-txt-muted py-2">
        No tours yet — a tour visits POIs in a set order.
      </div>
    );
  }

  const nameOf = (id: string) => pois.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="flex flex-col gap-1">
      {tours.map((tour) => {
        const selected = tour.id === selectedId;
        const stops = tour.poiIds.map(nameOf).join(" → ");
        return (
          <div
            key={tour.id}
            className={cn(
              "panel-inset px-2.5 py-2 flex items-start justify-between gap-2 transition-colors",
              selected && "border-cyan/40",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(tour.id)}
              aria-pressed={selected}
              className="min-w-0 flex-1 text-left cursor-pointer"
            >
              <div className="text-xs text-txt-primary truncate">
                {tour.name}
              </div>
              {tour.description && (
                <div className="text-[10px] text-txt-muted truncate">
                  {tour.description}
                </div>
              )}
              <div className="text-[10px] text-violet truncate" title={stops}>
                {stops || "no stops"}
              </div>
              <div className="flex gap-2 mt-0.5">
                <span className="label">{tour.poiIds.length} stops</span>
                {tour.returnPoiId && (
                  <span className="label">then {nameOf(tour.returnPoiId)}</span>
                )}
              </div>
            </button>
            <div className="flex gap-1 shrink-0">
              <MollyButton
                variant="ghost"
                size="sm"
                onClick={() => onEdit(tour)}
                aria-label={`Edit ${tour.name}`}
              >
                Edit
              </MollyButton>
              <MollyConfirmButton
                variant="danger"
                size="sm"
                onConfirm={() => onDelete(tour)}
                aria-label={`Delete ${tour.name}`}
              >
                <Trash2 size={11} />
              </MollyConfirmButton>
            </div>
          </div>
        );
      })}
    </div>
  );
}
