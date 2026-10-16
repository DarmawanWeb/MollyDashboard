import type {
  GetTourStateResponseWire,
  TourCommandWire,
  TourStateWire,
} from "@/types/ros/molly";
import type { RosHeader } from "@/types/ros/std";
import type {
  TourActivity,
  TourCommand,
  TourState,
  TourStateSnapshot,
} from "@/types/ui/tour";

// Re-export for consumers that previously imported wire types from here.
export type { GetTourStateResponseWire, TourCommandWire, TourStateWire };

/* ----------------------------------------------------------------------------
 * State enum
 * ------------------------------------------------------------------------- */

const STATE_TO_WIRE: Record<TourState, number> = {
  IDLE: 0,
  STARTING: 1,
  RUNNING: 2,
  PAUSED: 3,
  STOPPING: 4,
  ERROR: 5,
};

const WIRE_TO_STATE: Record<number, TourState> = Object.fromEntries(
  Object.entries(STATE_TO_WIRE).map(([k, v]) => [v, k as TourState]),
) as Record<number, TourState>;

/* ----------------------------------------------------------------------------
 * Command enum
 * ------------------------------------------------------------------------- */

const COMMAND_TO_WIRE: Record<TourCommand["kind"], number> = {
  START: 0,
  PAUSE: 1,
  RESUME: 2,
  STOP: 3,
  SKIP: 4,
};

/* ----------------------------------------------------------------------------
 * Decoders (wire → TS)
 * ------------------------------------------------------------------------- */

const KNOWN_ACTIVITIES: ReadonlyArray<TourActivity> = [
  "",
  "navigating",
  "narrating",
  "performing_motion",
];

function parseActivity(raw: string): TourActivity {
  return (KNOWN_ACTIVITIES as readonly string[]).includes(raw)
    ? (raw as TourActivity)
    : "";
}

function headerToMs(h: RosHeader): number {
  return h.stamp.sec * 1000 + Math.floor(h.stamp.nanosec / 1e6);
}

/**
 * Convert a wire TourState message into the dashboard's TourStateSnapshot.
 *
 * Defensive: falls back to IDLE if the enum value is unknown, since robot
 * could publish a future state after a firmware update without us crashing.
 */
export function decodeTourState(wire: TourStateWire): TourStateSnapshot {
  const state = WIRE_TO_STATE[wire.state] ?? "IDLE";
  return {
    state,
    currentPoiIndex: wire.current_poi_index,
    totalPois: wire.total_pois,
    currentPoiId: wire.current_poi_id || null,
    activity: parseActivity(wire.activity),
    timestamp: headerToMs(wire.header),
    errorReason: state === "ERROR" ? wire.error_reason || undefined : undefined,
  };
}

/* ----------------------------------------------------------------------------
 * Encoders (TS → wire)
 * ------------------------------------------------------------------------- */

/**
 * Convert a TourCommand to its wire form.
 */
export function encodeTourCommand(cmd: TourCommand): TourCommandWire {
  return {
    kind: COMMAND_TO_WIRE[cmd.kind],
    poi_ids: cmd.kind === "START" ? cmd.poiIds : [],
  };
}
