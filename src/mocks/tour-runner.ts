import { canTransition, nextState } from "@/lib/tour/fsm";
import type {
  TourActivity,
  TourCommand,
  TourState,
  TourStateSnapshot,
} from "@/types/ui/tour";

/** A stop of the mock tour. */
export interface MockTourStop {
  id: string;
  name: string;
  /** a gesture is performed on arrival */
  gesture: boolean;
}

/** What a START command resolves to (from the mock robot's site). */
export interface MockTourPlan {
  tourId: string;
  tourName: string;
  stops: MockTourStop[];
  returnTo: MockTourStop | null;
}

export type MockTourResolver = (
  cmd: Extract<TourCommand, { kind: "START" }>,
) => MockTourPlan | null;

interface RunnerState {
  state: TourState;
  plan: MockTourPlan | null;
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
  navigating: 4000,
  waiting_visitors: 2000,
  performing_motion: 1500,
  narrating: 3500,
  dwelling: 1500,
  returning: 4000,
};

/** Per stop: walk, gesture (when the POI has one), narrate, dwell. */
function stopSequence(stop: MockTourStop): Exclude<TourActivity, "">[] {
  return stop.gesture
    ? ["navigating", "performing_motion", "narrating", "dwelling"]
    : ["navigating", "narrating", "dwelling"];
}

const STARTING_LATENCY_MS = 300;
const STOPPING_LATENCY_MS = 300;

const IDLE: RunnerState = {
  state: "IDLE",
  plan: null,
  currentPoiIndex: -1,
  activity: "",
};

/**
 * Create a mock tour FSM with the robot's activities. Caller is responsible
 * for calling `shutdown()` when done (typically on component unmount).
 */
export function createMockTourRunner(
  resolve: MockTourResolver,
): MockTourRunner {
  let state: RunnerState = { ...IDLE };

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

  const currentStop = (): MockTourStop | null => {
    const plan = state.plan;
    if (!plan) return null;
    if (state.activity === "returning") return plan.returnTo;
    return plan.stops[state.currentPoiIndex] ?? null;
  };

  const snapshot = (): TourStateSnapshot => {
    const stop = currentStop();
    return {
      state: state.state,
      tourId: state.plan?.tourId ?? "",
      tourName: state.plan?.tourName ?? "",
      currentPoiIndex: state.currentPoiIndex,
      totalPois: state.plan?.stops.length ?? 0,
      currentPoiId: stop?.id ?? null,
      currentPoiName: stop?.name ?? "",
      activity: state.activity,
      message: stop ? `${state.activity || "idle"} · ${stop.name}` : "",
      timestamp: Date.now(),
      errorReason: state.errorReason,
    };
  };

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

  const finish = () => {
    state = { ...state, state: "STOPPING", activity: "" };
    emit();
    pendingTimer = setTimeout(() => {
      pendingTimer = null;
      state = { ...IDLE };
      emit();
    }, STOPPING_LATENCY_MS);
  };

  const beginStop = (index: number) => {
    const plan = state.plan;
    if (!plan) return;
    if (index >= plan.stops.length) {
      if (plan.returnTo) {
        state = { ...state, activity: "returning" };
        emit();
        activityTimer = setTimeout(() => {
          activityTimer = null;
          if (state.state === "RUNNING") finish();
        }, ACTIVITY_DURATIONS.returning);
        return;
      }
      finish();
      return;
    }
    state = { ...state, currentPoiIndex: index, activity: "navigating" };
    emit();
    scheduleNextActivity();
  };

  const scheduleNextActivity = () => {
    if (state.state !== "RUNNING" || state.activity === "") return;
    const stop = state.plan?.stops[state.currentPoiIndex];
    if (!stop) return;
    const activity = state.activity as Exclude<TourActivity, "">;

    activityTimer = setTimeout(() => {
      activityTimer = null;
      if (state.state !== "RUNNING") return;
      const sequence = stopSequence(stop);
      const next = sequence[sequence.indexOf(activity) + 1];
      if (next) {
        state = { ...state, activity: next };
        emit();
        scheduleNextActivity();
        return;
      }
      beginStop(state.currentPoiIndex + 1);
    }, ACTIVITY_DURATIONS[activity]);
  };

  const handleCommand = (cmd: TourCommand) => {
    if (!canTransition(state.state, cmd.kind)) {
      // Real robot would silently ignore + republish current state. Mock too.
      emit();
      return;
    }

    clearTimers();

    if (cmd.kind === "START") {
      const plan = resolve(cmd);
      if (!plan || plan.stops.length === 0) {
        state = {
          ...IDLE,
          state: "ERROR",
          errorReason: "Unknown tour or no POIs to visit",
        };
        emit();
        return;
      }
      state = {
        state: nextState(state.state, "START") ?? "STARTING",
        plan,
        currentPoiIndex: -1,
        activity: "",
      };
      emit();
      pendingTimer = setTimeout(() => {
        pendingTimer = null;
        state = { ...state, state: "RUNNING" };
        beginStop(0);
      }, STARTING_LATENCY_MS);
      return;
    }

    if (cmd.kind === "STOP") {
      if (state.state === "ERROR") {
        state = { ...IDLE };
        emit();
        return;
      }
      finish();
      return;
    }

    if (cmd.kind === "PAUSE") {
      // keep activity so RESUME picks up smoothly
      state = { ...state, state: "PAUSED" };
      emit();
      return;
    }

    if (cmd.kind === "RESUME") {
      state = { ...state, state: "RUNNING" };
      emit();
      scheduleNextActivity();
      return;
    }

    if (cmd.kind === "SKIP") {
      beginStop(state.currentPoiIndex + 1);
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
