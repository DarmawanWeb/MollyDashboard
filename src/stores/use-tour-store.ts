import { create } from "zustand";
import type { TourActivity, TourState } from "@/types/ui/tour";

/* ----------------------------------------------------------------------------
 * Store shape
 * ------------------------------------------------------------------------- */

/** Robot-authoritative fields, as applied from a /tour/state snapshot. */
export interface TourStorePayload {
  state: TourState;
  tourId: string;
  tourName: string;
  currentPoiIndex: number;
  totalPois: number;
  activePoiId: string | null;
  activePoiName: string;
  activity: TourActivity;
  message: string;
  errorReason?: string;
}

interface TourStore {
  /** Current FSM state. Set by useTourController from /tour/state echoes. */
  state: TourState;

  /** Saved tour being run, empty for an ad-hoc list of POIs. */
  tourId: string;
  tourName: string;
  /** 0-based index of POI currently being executed. -1 when idle. */
  currentPoiIndex: number;
  totalPois: number;
  /** Id of the active POI, or null when idle. */
  activePoiId: string | null;
  activePoiName: string;
  /** Sub-activity hint inside RUNNING. */
  activity: TourActivity;
  /** Robot's detail of the activity. */
  message: string;

  /** Seconds elapsed since tour was last set to RUNNING (client-side timer). */
  elapsed: number;

  /** Last error from robot, if state === "ERROR". */
  errorReason?: string;

  /**
   * True when active === true after start() and false after stop(),
   * regardless of optimistic state. Kept as derived field for legacy
   * consumers (SimulationLayer, providers) that just want "is a tour
   * happening right now".
   */
  active: boolean;

  /**
   * Internal mutation API — only the controller hook (and the mock runner
   * in dev) should call these. All public callers go through
   * useTourController().sendCommand().
   */
  __applySnapshot: (snapshot: TourStorePayload) => void;
  __setOptimistic: (state: TourState) => void;
  __tick: () => void;
  __resetElapsed: () => void;
}

/* ----------------------------------------------------------------------------
 * Store
 * ------------------------------------------------------------------------- */

const IDLE_SNAPSHOT = {
  state: "IDLE" as TourState,
  tourId: "",
  tourName: "",
  currentPoiIndex: -1,
  totalPois: 0,
  activePoiId: null,
  activePoiName: "",
  activity: "" as TourActivity,
  message: "",
  elapsed: 0,
  errorReason: undefined,
  active: false,
};

/**
 * Tour FSM runtime state.
 *
 * The robot is authoritative — every field except `elapsed` and `active`
 * is reset by `__applySnapshot()` from /tour/state messages. The dashboard
 * may set a transient optimistic state via `__setOptimistic()` while a
 * command is in-flight; reconciliation happens on next snapshot.
 *
 * `elapsed` is a pure client-side counter (saves robot bandwidth — no need
 * for the robot to publish a TourState every second just to update a timer).
 * It resets whenever the FSM transitions into RUNNING.
 */
export const useTourStore = create<TourStore>((set) => ({
  ...IDLE_SNAPSHOT,

  __applySnapshot: (s) =>
    set((prev) => {
      const transitionedToRunning =
        prev.state !== "RUNNING" && s.state === "RUNNING";
      return {
        state: s.state,
        tourId: s.tourId,
        tourName: s.tourName,
        currentPoiIndex: s.currentPoiIndex,
        totalPois: s.totalPois,
        activePoiId: s.activePoiId,
        activePoiName: s.activePoiName,
        activity: s.activity,
        message: s.message,
        errorReason: s.errorReason,
        active: s.state === "RUNNING" || s.state === "PAUSED",
        elapsed: transitionedToRunning ? 0 : prev.elapsed,
      };
    }),

  __setOptimistic: (state) =>
    set({
      state,
      // STARTING / STOPPING don't change indices etc — those wait for robot ack
    }),

  __tick: () =>
    set((prev) =>
      prev.state === "RUNNING" ? { elapsed: prev.elapsed + 1 } : {},
    ),

  __resetElapsed: () => set({ elapsed: 0 }),
}));
