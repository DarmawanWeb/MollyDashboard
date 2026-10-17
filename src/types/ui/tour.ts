/* ----------------------------------------------------------------------------
 * State
 * ------------------------------------------------------------------------- */

/**
 * Tour FSM state.
 *
 * Robot is the FSM authority; dashboard receives `TourState` messages on
 * /tour/state and reflects them in UI. Pending states (STARTING, STOPPING)
 * may be set optimistically by the dashboard while a command is in flight,
 * and are reconciled when the robot publishes its real state.
 */
export type TourState =
  | "IDLE" // no tour active
  | "STARTING" // command sent, waiting for robot ack (≤3s)
  | "RUNNING" // tour in progress (walk + gesture + narrate + dwell)
  | "PAUSED" // explicitly paused, can resume
  | "STOPPING" // stop command sent, waiting for robot to wind down
  | "ERROR"; // robot reported failure

/**
 * Sub-activity hint inside RUNNING state.
 * Free-form on the wire; dashboard treats unknown values as empty.
 */
export type TourActivity =
  | "" // none / idle
  | "navigating"
  | "waiting_visitors"
  | "performing_motion"
  | "narrating"
  | "dwelling"
  | "returning";

/**
 * Snapshot of tour FSM state. Mirrors molly_interfaces/msg/TourState.
 */
export interface TourStateSnapshot {
  state: TourState;
  /** Saved tour being run, empty for an ad-hoc list of POIs. */
  tourId: string;
  tourName: string;
  /** 0-based index of POI currently being executed. -1 when idle. */
  currentPoiIndex: number;
  /** Total POIs in active tour. 0 when idle. */
  totalPois: number;
  /** Active POI id, or null when idle. */
  currentPoiId: string | null;
  currentPoiName: string;
  /** Sub-activity hint for UI badges. */
  activity: TourActivity;
  /** Human-readable detail of the activity. */
  message: string;
  /** ms since unix epoch (Header.stamp converted). */
  timestamp: number;
  /** Populated only when state === "ERROR". */
  errorReason?: string;
}

/* ----------------------------------------------------------------------------
 * Commands
 * ------------------------------------------------------------------------- */

/**
 * Dashboard → robot tour command. Mirrors molly_interfaces/msg/TourCommand.
 *
 * START runs a saved tour (`tourId`) or, when it is empty, the given POIs in
 * order (`poiIds`).
 */
export type TourCommand =
  | { kind: "START"; tourId: string; poiIds: string[] }
  | { kind: "PAUSE" }
  | { kind: "RESUME" }
  | { kind: "STOP" }
  | { kind: "SKIP" };

export type TourCommandKind = TourCommand["kind"];

/* ----------------------------------------------------------------------------
 * Definitions
 * ------------------------------------------------------------------------- */

/** A saved tour of the active site (site/tours). */
export interface TourDefinition {
  id: string;
  name: string;
  description: string;
  /** Stops in visiting order */
  poiIds: string[];
  /** Walk here after the last stop; empty: stay */
  returnPoiId: string;
}
