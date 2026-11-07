"use client";

import { useCallback, useState } from "react";
import { useRobotAction } from "@/hooks/use-robot-action";
import { useRobotApi } from "@/hooks/use-robot-api";
import type { POI } from "@/types";

type PlacementTarget = "new" | "move";

const NEW_POI: POI = {
  id: "",
  name: "",
  description: "",
  x: 0,
  y: 0,
  yaw: 0,
  narration: "",
  language: "",
  gesture: "",
  dwellSec: 5,
};

export interface UsePoiEditorResult {
  selectedId: string | null;
  /** POI in the form (new: empty id), null when the form is closed */
  draft: POI | null;
  /** The new POI takes the robot's pose when saved */
  atRobotPose: boolean;
  /** Waiting for a map click (+ drag for the heading) */
  placing: boolean;
  saving: boolean;

  startAdd: () => void;
  startAddAtRobot: () => void;
  /** Re-place the POI in the form on the map */
  startMove: () => void;
  cancelPlacement: () => void;
  /** Called by the map canvas in placement mode */
  place: (pose: { x: number; y: number; yaw: number }) => void;
  edit: (poi: POI) => void;
  update: (patch: Partial<POI>) => void;
  save: () => Promise<void>;
  cancel: () => void;
  remove: (poi: POI) => Promise<void>;
  toggleSelect: (id: string) => void;
}

/**
 * POI editing state for the mapping page. POIs live on the robot: saving and
 * deleting go through /site/save_poi and /site/delete_poi, and the list the
 * page shows is the robot's /site/pois.
 */
export function usePoiEditor(): UsePoiEditorResult {
  const api = useRobotApi();
  const { run, busy } = useRobotAction();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<POI | null>(null);
  const [atRobotPose, setAtRobotPose] = useState(false);
  const [placing, setPlacing] = useState<PlacementTarget | null>(null);

  const startAdd = useCallback(() => {
    setDraft(null);
    setAtRobotPose(false);
    setPlacing("new");
  }, []);

  const startAddAtRobot = useCallback(() => {
    setPlacing(null);
    setAtRobotPose(true);
    setDraft({ ...NEW_POI });
  }, []);

  const startMove = useCallback(() => {
    setAtRobotPose(false);
    setPlacing("move");
  }, []);

  const cancelPlacement = useCallback(() => setPlacing(null), []);

  const place = useCallback(
    (pose: { x: number; y: number; yaw: number }) => {
      setDraft((prev) =>
        placing === "move" && prev
          ? { ...prev, ...pose }
          : { ...NEW_POI, ...pose },
      );
      setPlacing(null);
    },
    [placing],
  );

  const edit = useCallback((poi: POI) => {
    setPlacing(null);
    setAtRobotPose(false);
    setSelectedId(poi.id);
    setDraft({ ...poi });
  }, []);

  const update = useCallback((patch: Partial<POI>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const save = useCallback(async () => {
    if (!draft || !draft.name.trim()) return;
    const res = await run(
      "save",
      draft.id ? `Update ${draft.name}` : `Add ${draft.name}`,
      () => api.savePoi(draft, atRobotPose),
      { successToast: true },
    );
    if (res?.success) {
      setSelectedId(res.poi?.id ?? draft.id ?? null);
      setDraft(null);
      setAtRobotPose(false);
    }
  }, [api, run, draft, atRobotPose]);

  const cancel = useCallback(() => {
    setDraft(null);
    setPlacing(null);
    setAtRobotPose(false);
  }, []);

  const remove = useCallback(
    async (poi: POI) => {
      const res = await run("delete", `Delete ${poi.name}`, () =>
        api.deletePoi(poi.id),
      );
      if (res?.success) {
        setSelectedId((id) => (id === poi.id ? null : id));
        setDraft((d) => (d?.id === poi.id ? null : d));
      }
    },
    [api, run],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedId((curr) => (curr === id ? null : id));
  }, []);

  return {
    selectedId,
    draft,
    atRobotPose,
    placing: placing !== null,
    saving: busy === "save",
    startAdd,
    startAddAtRobot,
    startMove,
    cancelPlacement,
    place,
    edit,
    update,
    save,
    cancel,
    remove,
    toggleSelect,
  };
}
