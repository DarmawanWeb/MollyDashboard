import { create } from "zustand";
import type { TourActivity, TourState } from "@/types/ui/tour";

/* ----------------------------------------------------------------------------
 * Store shape
 * ------------------------------------------------------------------------- */

interface TourStore {
  /** Current FSM state. Set by useTourController from /tour/state echoes. */
  state: TourState;

  /** 0-based index of POI currently being executed. -1 when idle. */
  currentPoiIndex: number;
  totalPois: number;
  /** UUID of active POI, or null when idle. */
  activePoiId: string | null;
  /** Sub-activity hint inside RUNNING. */
  activity: TourActivity;

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
  __applySnapshot: (snapshot: {
    state: TourState;
    currentPoiIndex: number;
    totalPois: number;
    activePoiId: string | null;
    activity: TourActivity;
    errorReason?: string;
  }) => void;
  __setOptimistic: (state: TourState) => void;
  __tick: () => void;
  __resetElapsed: () => void;
}

/* ----------------------------------------------------------------------------
 * Store
 * ------------------------------------------------------------------------- */

const IDLE_SNAPSHOT = {
  state: "IDLE" as TourState,
  currentPoiIndex: -1,
  totalPois: 0,
  activePoiId: null,
  activity: "" as TourActivity,
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
        currentPoiIndex: s.currentPoiIndex,
        totalPois: s.totalPois,
        activePoiId: s.activePoiId,
        activity: s.activity,
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
