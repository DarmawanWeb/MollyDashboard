import type { TourCommand, TourCommandKind, TourState } from "@/types/ui/tour";

/**
 * Transition matrix.
 *
 * For each (state, command), the value is either:
 *   - a TourState the dashboard transitions to optimistically, OR
 *   - null  → command is invalid in this state (button should be disabled)
 *
 * Source of truth lives on the robot. These optimistic targets just provide
 * snappier UX during the ack window — robot's authoritative state always
 * wins on next /tour/state message.
 */
const TRANSITIONS: Record<
  TourState,
  Partial<Record<TourCommandKind, TourState>>
> = {
  IDLE: {
    START: "STARTING",
  },
  STARTING: {
    STOP: "STOPPING",
  },
  RUNNING: {
    PAUSE: "PAUSED",
    STOP: "STOPPING",
    SKIP: "RUNNING", // stays in RUNNING, robot updates currentPoiIndex
  },
  PAUSED: {
    RESUME: "RUNNING",
    STOP: "STOPPING",
  },
  STOPPING: {
    // terminal — nothing accepted until robot lands in IDLE
  },
  ERROR: {
    START: "STARTING",
    STOP: "IDLE", // clearing the error
  },
};

/* ----------------------------------------------------------------------------
 * Public API
 * ------------------------------------------------------------------------- */

/**
 * Returns true if `command` is valid from `state`.
 *
 * Use to enable/disable command buttons in the UI.
 */
export function canTransition(
  state: TourState,
  command: TourCommandKind,
): boolean {
  return TRANSITIONS[state]?.[command] !== undefined;
}

/**
 * Returns the optimistic next state after applying `command` from `state`,
 * or null if the command is invalid.
 *
 * The dashboard sets this optimistic state immediately, then reconciles
 * when the robot publishes its real /tour/state.
 */
export function nextState(
  state: TourState,
  command: TourCommandKind,
): TourState | null {
  return TRANSITIONS[state]?.[command] ?? null;
}

/**
 * Returns true if the state is "pending" — i.e. a command is in flight and
 * the robot hasn't yet confirmed the outcome.
 *
 * UI typically renders a spinner and disables all command buttons here.
 */
export function isPending(state: TourState): boolean {
  return state === "STARTING" || state === "STOPPING";
}

/**
 * Returns true if a tour is currently considered "active" for purposes of
 * the simulation layer and the elapsed-time ticker.
 *
 * Excludes STARTING (no real tour yet) and STOPPING/ERROR (winding down).
 */
export function isActive(state: TourState): boolean {
  return state === "RUNNING" || state === "PAUSED";
}

/**
 * Helper for UI rendering — short human-readable label per state.
 */
export function stateLabel(state: TourState): string {
  switch (state) {
    case "IDLE":
      return "Idle";
    case "STARTING":
      return "Starting…";
    case "RUNNING":
      return "Running";
    case "PAUSED":
      return "Paused";
    case "STOPPING":
      return "Stopping…";
    case "ERROR":
      return "Error";
  }
}

/**
 * Validate that a command object's shape matches its kind.
 * Returns the command unchanged if valid, throws otherwise.
 *
 * Useful guard before serializing to the wire.
 */
export function validateCommand(cmd: TourCommand): TourCommand {
  if (cmd.kind === "START" && !Array.isArray(cmd.poiIds)) {
    throw new Error("START command requires poiIds array");
  }
  if (cmd.kind === "START" && cmd.poiIds.length === 0) {
    throw new Error("START command requires non-empty poiIds");
  }
  return cmd;
}
