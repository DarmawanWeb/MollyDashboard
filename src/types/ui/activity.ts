/**
 * What the robot is doing right now, derived from the robot-side state
 * (e-stop, mapping, tour, path finder, control mode) for status badges.
 */

export type RobotActivityKey =
  | "OFFLINE"
  | "IDLE"
  | "REMOTE"
  | "MAPPING"
  | "WALKING"
  | "BLOCKED"
  | "TOURING"
  | "NARRATING"
  | "PERFORMING"
  | "WAITING"
  | "ESTOP";

/** Visual metadata for an activity badge. */
export interface ActivityStyle {
  label: string;
  bgClass: string;
  borderClass: string;
  dotClass: string;
  textClass: string;
}
