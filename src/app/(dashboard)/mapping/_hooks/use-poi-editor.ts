"use client";

import { useCallback, useState } from "react";
import type { MotionAction, OccupancyGrid, POI } from "@/types";

export interface POIForm {
  name: string;
  description: string;
  dwellTimeSec: number;
  narrationText: string;
  motionAction: MotionAction;
}

const DEFAULT_FORM: POIForm = {
  name: "",
  description: "",
  dwellTimeSec: 30,
  narrationText: "",
  motionAction: "none",
};

interface PendingCoord {
  x: number;
  y: number;
}

export interface UsePoiEditorResult {
  // state
  pois: POI[];
  selectedId: string | null;
  editingId: string | null;
  pendingCoord: PendingCoord | null;
  addMode: boolean;
  form: POIForm;
  /** True when the form panel should be visible */
  isFormOpen: boolean;

  // setters
  setForm: (next: POIForm | ((prev: POIForm) => POIForm)) => void;

  // actions
  startAdd: () => void;
  cancelAdd: () => void;
  /** Called when user clicks the map in add mode. world is in meters. */
  placeAt: (world: { x: number; y: number }, grid: OccupancyGrid) => void;
  selectPoi: (id: string | null) => void;
  toggleSelect: (id: string) => void;
  editPoi: (poi: POI) => void;
  saveForm: () => void;
  cancelForm: () => void;
  deletePoi: (id: string) => void;
}

/**
 * Consolidated POI editing state for the mapping page.
 *
 * Owns four pieces of state that previously lived inline:
 *   - pois            (the list)
 *   - selectedId      (highlight on map + list)
 *   - editingId       (which POI is being edited)
 *   - pendingCoord    (where a new POI will be placed)
 *   - addMode         (waiting for map click)
 *   - form            (form field values)
 *
 * The form is open when there's a pending coord OR an active editing id.
 */
export function usePoiEditor(): UsePoiEditorResult {
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingCoord, setPendingCoord] = useState<PendingCoord | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [form, setForm] = useState<POIForm>(DEFAULT_FORM);

  const startAdd = useCallback(() => {
    setAddMode(true);
    setEditingId(null);
    setPendingCoord(null);
    setForm(DEFAULT_FORM);
  }, []);

  const cancelAdd = useCallback(() => {
    setAddMode(false);
  }, []);

  const placeAt = useCallback(
    (world: { x: number; y: number }, grid: OccupancyGrid) => {
      const { resolution, origin } = grid.info;
      const cell = {
        x: Math.floor((world.x - origin.position.x) / resolution),
        y: Math.floor((world.y - origin.position.y) / resolution),
      };
      setPendingCoord(cell);
      setAddMode(false);
    },
    [],
  );

  const selectPoi = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedId((curr) => (curr === id ? null : id));
  }, []);

  const editPoi = useCallback((poi: POI) => {
    setEditingId(poi.id);
    setPendingCoord(null);
    setAddMode(false);
    setForm({
      name: poi.name,
      description: poi.description,
      dwellTimeSec: poi.dwellTimeSec,
      narrationText: poi.narrationText ?? "",
      motionAction: poi.motionAction ?? "none",
    });
  }, []);

  const saveForm = useCallback(() => {
    if (!form.name.trim()) return;

    if (editingId) {
      setPois((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, ...form, dwellTimeSec: Number(form.dwellTimeSec) }
            : p,
        ),
      );
      setEditingId(null);
    } else if (pendingCoord) {
      const poi: POI = {
        id: crypto.randomUUID(),
        ...form,
        dwellTimeSec: Number(form.dwellTimeSec),
        x: pendingCoord.x,
        y: pendingCoord.y,
        orderIndex: pois.length,
        mapId: "current",
      };
      setPois((prev) => [...prev, poi]);
      setPendingCoord(null);
    }
    setForm(DEFAULT_FORM);
  }, [form, editingId, pendingCoord, pois.length]);

  const cancelForm = useCallback(() => {
    setPendingCoord(null);
    setEditingId(null);
    setForm(DEFAULT_FORM);
  }, []);

  const deletePoi = useCallback(
    (id: string) => {
      setPois((prev) => prev.filter((p) => p.id !== id));
      if (selectedId === id) setSelectedId(null);
      if (editingId === id) {
        setEditingId(null);
        setForm(DEFAULT_FORM);
      }
    },
    [selectedId, editingId],
  );

  return {
    pois,
    selectedId,
    editingId,
    pendingCoord,
    addMode,
    form,
    isFormOpen: !!pendingCoord || !!editingId,
    setForm,
    startAdd,
    cancelAdd,
    placeAt,
    selectPoi,
    toggleSelect,
    editPoi,
    saveForm,
    cancelForm,
    deletePoi,
  };
}
