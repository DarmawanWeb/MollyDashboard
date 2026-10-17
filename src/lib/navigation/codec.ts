/**
 * Path finder / follower conversions (planner/status, planner/path,
 * navigation/status).
 */

import type {
  NavigationStatusWire,
  PlannerStatusWire,
} from "@/types/ros/molly";
import type { Path } from "@/types/ros/nav";
import type {
  NavigationSnapshot,
  PathPoint,
  PlannerSnapshot,
  PlannerState,
} from "@/types/ui";

const PLANNER_STATES: ReadonlyArray<PlannerState> = [
  "idle",
  "planning",
  "following",
  "replanning",
  "arrived",
  "failed",
  "cancelled",
];

export const IDLE_PLANNER: PlannerSnapshot = {
  state: "idle",
  goalId: "",
  goal: null,
  pathLength: 0,
  remaining: 0,
  replans: 0,
  message: "",
};

export function parsePlannerState(raw: string): PlannerState {
  return (PLANNER_STATES as readonly string[]).includes(raw)
    ? (raw as PlannerState)
    : "idle";
}

/** True while the robot walks (or is about to walk) to a goal. */
export function isWalking(state: PlannerState): boolean {
  return (
    state === "planning" || state === "following" || state === "replanning"
  );
}

export function decodePlannerStatus(w: PlannerStatusWire): PlannerSnapshot {
  const state = parsePlannerState(w.state);
  return {
    state,
    goalId: w.goal_id,
    goal:
      state === "idle" ? null : { x: w.goal_x, y: w.goal_y, yaw: w.goal_yaw },
    pathLength: w.path_length,
    remaining: w.remaining,
    replans: w.replans,
    message: w.message,
  };
}

export function decodeNavigationStatus(
  w: NavigationStatusWire,
): NavigationSnapshot {
  return { state: w.state, message: w.message };
}

/** nav_msgs/Path → points, keeping at most `maxPoints` for drawing. */
export function decodePath(path: Path, maxPoints = 400): PathPoint[] {
  const poses = path.poses;
  if (poses.length === 0) return [];
  const step = Math.max(1, Math.ceil(poses.length / maxPoints));
  const out: PathPoint[] = [];
  for (let i = 0; i < poses.length; i += step) {
    const p = poses[i].pose.position;
    out.push({ x: p.x, y: p.y });
  }
  const last = poses[poses.length - 1].pose.position;
  const tail = out[out.length - 1];
  if (tail.x !== last.x || tail.y !== last.y)
    out.push({ x: last.x, y: last.y });
  return out;
}
