import { canTransition, nextState } from "@/lib/tour/fsm";
import type {
  TourActivity,
  TourCommand,
  TourState,
  TourStateSnapshot,
} from "@/types/ui/tour";

interface RunnerState {
  state: TourState;
  poiIds: string[];
  currentPoiIndex: number;
  activity: TourActivity;
  errorReason?: string;
}

export interface MockTourRunner {
  /** Process a command from the dashboard. */
  sendCommand: (cmd: TourCommand) => void;
  /** Subscribe to state changes. Receives initial state immediately. */
  subscribe: (handler: (snapshot: TourStateSnapshot) => void) => () => void;
  /** Stop all timers and release resources. */
  shutdown: () => void;
}

const ACTIVITY_DURATIONS: Record<Exclude<TourActivity, "">, number> = {
  navigating: 2000,
  narrating: 3000,
  performing_motion: 1000,
};

const ACTIVITY_SEQUENCE: ReadonlyArray<Exclude<TourActivity, "">> = [
  "navigating",
  "narrating",
  "performing_motion",
];

const STARTING_LATENCY_MS = 300;
const STOPPING_LATENCY_MS = 300;

/**
 * Create a mock tour FSM. Caller is responsible for calling `shutdown()`
 * when done (typically on component unmount).
 */
export function createMockTourRunner(): MockTourRunner {
  let state: RunnerState = {
    state: "IDLE",
    poiIds: [],
    currentPoiIndex: -1,
    activity: "",
  };

  const subscribers = new Set<(s: TourStateSnapshot) => void>();
  let activityTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingTimer: ReturnType<typeof setTimeout> | null = null;

  const clearTimers = () => {
    if (activityTimer) {
      clearTimeout(activityTimer);
      activityTimer = null;
    }
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
  };

  const snapshot = (): TourStateSnapshot => ({
    state: state.state,
    currentPoiIndex: state.currentPoiIndex,
    totalPois: state.poiIds.length,
    currentPoiId: state.poiIds[state.currentPoiIndex] ?? null,
    activity: state.activity,
    timestamp: Date.now(),
    errorReason: state.errorReason,
  });

  const emit = () => {
    const snap = snapshot();
    for (const sub of subscribers) {
      try {
        sub(snap);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[mock-tour] subscriber error:", err);
      }
    }
  };

  const scheduleNextActivity = () => {
    if (state.state !== "RUNNING") return;
    if (state.activity === "") {
      // shouldn't happen if RUNNING, but be defensive
      state.activity = "navigating";
      emit();
    }

    const duration =
      ACTIVITY_DURATIONS[state.activity as Exclude<TourActivity, "">] ?? 2000;

    activityTimer = setTimeout(() => {
      activityTimer = null;
      if (state.state !== "RUNNING") return;

      const idx = ACTIVITY_SEQUENCE.indexOf(
        state.activity as Exclude<TourActivity, "">,
      );
      const next = ACTIVITY_SEQUENCE[idx + 1];

      if (next) {
        state.activity = next;
        emit();
        scheduleNextActivity();
        return;
      }

      // Completed full cycle on current POI — advance to next or finish.
      if (state.currentPoiIndex + 1 < state.poiIds.length) {
        state.currentPoiIndex += 1;
        state.activity = "navigating";
        emit();
        scheduleNextActivity();
      } else {
        // tour complete — auto-stop
        state.state = "STOPPING";
        state.activity = "";
        emit();
        pendingTimer = setTimeout(() => {
          pendingTimer = null;
          state = {
            state: "IDLE",
            poiIds: [],
            currentPoiIndex: -1,
            activity: "",
          };
          emit();
        }, STOPPING_LATENCY_MS);
      }
    }, duration);
  };

  const handleCommand = (cmd: TourCommand) => {
    if (!canTransition(state.state, cmd.kind)) {
      // Real robot would silently ignore + republish current state. Mock too.
      emit();
      return;
    }

    const optimistic = nextState(state.state, cmd.kind);
    if (!optimistic) return; // already checked canTransition, but TS narrowing

    clearTimers();

    if (cmd.kind === "START") {
      state = {
        state: "STARTING",
        poiIds: cmd.poiIds,
        currentPoiIndex: -1,
        activity: "",
      };
      emit();
      pendingTimer = setTimeout(() => {
        pendingTimer = null;
        state.state = "RUNNING";
        state.currentPoiIndex = 0;
        state.activity = "navigating";
        emit();
        scheduleNextActivity();
      }, STARTING_LATENCY_MS);
      return;
    }

    if (cmd.kind === "STOP") {
      state.state = "STOPPING";
      state.activity = "";
      emit();
      pendingTimer = setTimeout(() => {
        pendingTimer = null;
        state = {
          state: "IDLE",
          poiIds: [],
          currentPoiIndex: -1,
          activity: "",
        };
        emit();
      }, STOPPING_LATENCY_MS);
      return;
    }

    if (cmd.kind === "PAUSE") {
      state.state = "PAUSED";
      // keep activity so RESUME picks up smoothly
      emit();
      return;
    }

    if (cmd.kind === "RESUME") {
      state.state = "RUNNING";
      emit();
      scheduleNextActivity();
      return;
    }

    if (cmd.kind === "SKIP") {
      if (state.currentPoiIndex + 1 < state.poiIds.length) {
        state.currentPoiIndex += 1;
        state.activity = "navigating";
        emit();
        scheduleNextActivity();
      } else {
        // skip past end → finish tour
        state.state = "STOPPING";
        state.activity = "";
        emit();
        pendingTimer = setTimeout(() => {
          pendingTimer = null;
          state = {
            state: "IDLE",
            poiIds: [],
            currentPoiIndex: -1,
            activity: "",
          };
          emit();
        }, STOPPING_LATENCY_MS);
      }
      return;
    }
  };

  return {
    sendCommand: handleCommand,
    subscribe: (handler) => {
      subscribers.add(handler);
      // emit current state immediately so the dashboard bootstraps right
      handler(snapshot());
      return () => {
        subscribers.delete(handler);
      };
    },
    shutdown: () => {
      clearTimers();
      subscribers.clear();
    },
  };
}
