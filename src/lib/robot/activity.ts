/**
 * Derive one robot activity from the robot-side states, for the status badge.
 * Pure: the order of the checks is the priority.
 */

import type {
  ControlMode,
  PlannerState,
  RobotActivityKey,
  TourActivity,
  TourState,
} from "@/types/ui";

export interface ActivityInputs {
  connected: boolean;
  estopEngaged: boolean;
  mode: ControlMode;
  mappingActive: boolean;
  tourState: TourState;
  tourActivity: TourActivity;
  plannerState: PlannerState;
  navigationState: string;
}

export function deriveActivity(i: ActivityInputs): RobotActivityKey {
  if (!i.connected) return "OFFLINE";
  if (i.estopEngaged) return "ESTOP";
  if (i.navigationState === "BLOCKED") return "BLOCKED";
  if (i.mappingActive) return "MAPPING";
  if (i.tourState === "RUNNING" || i.tourState === "PAUSED") {
    switch (i.tourActivity) {
      case "narrating":
        return "NARRATING";
      case "performing_motion":
        return "PERFORMING";
      case "waiting_visitors":
        return "WAITING";
      default:
        return "TOURING";
    }
  }
  if (
    i.plannerState === "planning" ||
    i.plannerState === "following" ||
    i.plannerState === "replanning"
  ) {
    return "WALKING";
  }
  if (i.mode === "remote") return "REMOTE";
  return "IDLE";
}
