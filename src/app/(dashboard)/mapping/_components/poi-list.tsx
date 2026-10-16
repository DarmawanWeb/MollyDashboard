"use client";

import type { POI } from "@/types";
import { POIListItem } from "./poi-list-item";

interface POIListProps {
  pois: POI[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (poi: POI) => void;
  onDelete: (id: string) => void;
}

export function POIList({
  pois,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: POIListProps) {
  if (pois.length === 0) {
    return (
      <div className="text-xs text-txt-muted text-center py-4">
        No POIs yet — click the button above to add one.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
      {pois.map((poi, i) => (
        <POIListItem
          key={poi.id}
          poi={poi}
          index={i}
          selected={poi.id === selectedId}
          onSelect={() => onSelect(poi.id)}
          onEdit={() => onEdit(poi)}
          onDelete={() => onDelete(poi.id)}
        />
      ))}
    </div>
  );
}
