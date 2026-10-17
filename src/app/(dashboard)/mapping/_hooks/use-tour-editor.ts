"use client";

import { useCallback, useMemo, useState } from "react";
import type { MapRoute } from "@/components/map/occupancy-canvas";
import { useRobotAction } from "@/hooks/use-robot-action";
import { useRobotApi } from "@/hooks/use-robot-api";
import { useSiteStore } from "@/stores/use-site-store";
import type { POI, TourDefinition } from "@/types";

const NEW_TOUR: TourDefinition = {
  id: "",
  name: "",
  description: "",
  poiIds: [],
  returnPoiId: "",
};

export interface UseTourEditorResult {
  /** Tour in the form (new: empty id), null when the form is closed */
  draft: TourDefinition | null;
  /** Tour highlighted in the list */
  selectedId: string | null;
  /** The draft, else the selected tour, drawn on the map */
  route: MapRoute | null;
  saving: boolean;

  startNew: () => void;
  edit: (tour: TourDefinition) => void;
  update: (patch: Partial<TourDefinition>) => void;
  addStop: (poiId: string) => void;
  /** Swap a stop with its neighbour (-1: earlier, 1: later) */
  moveStop: (index: number, delta: -1 | 1) => void;
  removeStop: (index: number) => void;
  save: () => Promise<void>;
  cancel: () => void;
  remove: (tour: TourDefinition) => Promise<void>;
  toggleSelect: (id: string) => void;
}

function toRoute(tour: TourDefinition, pois: POI[]): MapRoute {
  const byId = new Map(pois.map((p) => [p.id, p]));
  const stops = tour.poiIds
    .map((id) => byId.get(id))
    .filter((p): p is POI => p !== undefined);
  return { stops, returnTo: byId.get(tour.returnPoiId) ?? null };
}

/**
 * Tour editing state for the mapping page. Tours live on the robot: saving
 * and deleting go through /site/save_tour and /site/delete_tour, and the
 * list the page shows is the robot's /site/tours.
 */
export function useTourEditor(): UseTourEditorResult {
  const api = useRobotApi();
  const { run, busy } = useRobotAction();
  const pois = useSiteStore((s) => s.pois);
  const tours = useSiteStore((s) => s.tours);

  const [draft, setDraft] = useState<TourDefinition | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const shown = draft ?? tours.find((t) => t.id === selectedId) ?? null;
  const route = useMemo(
    () => (shown ? toRoute(shown, pois) : null),
    [shown, pois],
  );

  const startNew = useCallback(() => {
    setSelectedId(null);
    setDraft({ ...NEW_TOUR });
  }, []);

  const edit = useCallback((tour: TourDefinition) => {
    setSelectedId(tour.id);
    setDraft({ ...tour, poiIds: [...tour.poiIds] });
  }, []);

  const update = useCallback((patch: Partial<TourDefinition>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const addStop = useCallback((poiId: string) => {
    setDraft((prev) =>
      prev && poiId && !prev.poiIds.includes(poiId)
        ? { ...prev, poiIds: [...prev.poiIds, poiId] }
        : prev,
    );
  }, []);

  const moveStop = useCallback((index: number, delta: -1 | 1) => {
    setDraft((prev) => {
      const to = index + delta;
      if (!prev || to < 0 || to >= prev.poiIds.length) return prev;
      const poiIds = [...prev.poiIds];
      [poiIds[index], poiIds[to]] = [poiIds[to], poiIds[index]];
      return { ...prev, poiIds };
    });
  }, []);

  const removeStop = useCallback((index: number) => {
    setDraft((prev) =>
      prev
        ? { ...prev, poiIds: prev.poiIds.filter((_, i) => i !== index) }
        : prev,
    );
  }, []);

  const save = useCallback(async () => {
    if (!draft || !draft.name.trim() || draft.poiIds.length === 0) return;
    const res = await run(
      "save",
      draft.id ? `Update ${draft.name}` : `Add ${draft.name}`,
      () => api.saveTour(draft),
      { successToast: true },
    );
    if (res?.success) {
      setSelectedId(res.tour?.id ?? (draft.id || null));
      setDraft(null);
    }
  }, [api, run, draft]);

  const cancel = useCallback(() => setDraft(null), []);

  const remove = useCallback(
    async (tour: TourDefinition) => {
      const res = await run("delete", `Delete ${tour.name}`, () =>
        api.deleteTour(tour.id),
      );
      if (res?.success) {
        setSelectedId((id) => (id === tour.id ? null : id));
        setDraft((d) => (d?.id === tour.id ? null : d));
      }
    },
    [api, run],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedId((curr) => (curr === id ? null : id));
  }, []);

  return {
    draft,
    selectedId,
    route,
    saving: busy === "save",
    startNew,
    edit,
    update,
    addStop,
    moveStop,
    removeStop,
    save,
    cancel,
    remove,
    toggleSelect,
  };
}
