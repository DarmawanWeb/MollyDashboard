/**
 * Finite State Machine state keys for robot lifecycle.
 */

export type FSMStateKey =
  | "IDLE"
  | "BOOTING"
  | "LOCALIZING"
  | "NAVIGATING"
  | "NARRATING"
  | "INTERACTING"
  | "PERFORMING"
  | "OBSTACLE_BLOCKED"
  | "RETURNING"
  | "ESTOP";

/**
 * Visual metadata for rendering FSM state badges.
 */
export interface FSMStateInfo {
  label: string;
  bgClass: string;
  borderClass: string;
  dotClass: string;
  textClass: string;
}
