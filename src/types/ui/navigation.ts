/**
 * Path finder and path follower snapshots.
 */

export type PlannerState =
  | "idle"
  | "planning"
  | "following"
  | "replanning"
  | "arrived"
  | "failed"
  | "cancelled";

export interface PlannerSnapshot {
  state: PlannerState;
  /** POI id of the goal, empty for a pose goal */
  goalId: string;
  goal: { x: number; y: number; yaw: number } | null;
  /** m */
  pathLength: number;
  /** m */
  remaining: number;
  replans: number;
  message: string;
}

/** navigation/status of the path follower (FOLLOWING, BLOCKED, ...). */
export interface NavigationSnapshot {
  state: string;
  message: string;
}

export interface PathPoint {
  x: number;
  y: number;
}
