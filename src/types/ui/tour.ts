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
  | "RUNNING" // tour in progress (nav + narrate + perform)
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
  | "narrating"
  | "performing_motion";

/**
 * Snapshot of tour FSM state. Mirrors molly_msgs/msg/TourState.
 */
export interface TourStateSnapshot {
  state: TourState;
  /** 0-based index of POI currently being executed. -1 when idle. */
  currentPoiIndex: number;
  /** Total POIs in active tour. 0 when idle. */
  totalPois: number;
  /** Active POI id, or null when idle. */
  currentPoiId: string | null;
  /** Sub-activity hint for UI badges. */
  activity: TourActivity;
  /** ms since unix epoch (Header.stamp converted). */
  timestamp: number;
  /** Populated only when state === "ERROR". */
  errorReason?: string;
}

/* ----------------------------------------------------------------------------
 * Commands
 * ------------------------------------------------------------------------- */

/**
 * Dashboard → robot tour command.
 *
 * Mirrors molly_msgs/msg/TourCommand. `poi_ids` only populated for START.
 */
export type TourCommand =
  | { kind: "START"; poiIds: string[] }
  | { kind: "PAUSE" }
  | { kind: "RESUME" }
  | { kind: "STOP" }
  | { kind: "SKIP" };

export type TourCommandKind = TourCommand["kind"];

/* ----------------------------------------------------------------------------
 * Legacy compat
 * ------------------------------------------------------------------------- */

/**
 * Legacy shape retained for callers that haven't migrated yet.
 *
 * TODO(refactor-15): once all consumers use TourStateSnapshot, remove.
 */
export interface TourStatus {
  active: boolean;
  currentPoiIndex: number;
  totalPois: number;
  /** Seconds since tour started — client-side counter, not from robot. */
  elapsed: number;
  activePoi: string | null;
}
