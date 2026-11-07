"use client";

import { useCallback, useEffect } from "react";
import { getRos, SERVICES, TOPICS } from "@/lib/ros";
import {
  canTransition,
  isPending,
  nextState,
  validateCommand,
} from "@/lib/tour/fsm";
import {
  decodeTourState,
  encodeTourCommand,
  type TourStateWire,
} from "@/lib/tour/messages";
import { getMockRobot } from "@/mocks/mock-robot";
import {
  createMockTourRunner,
  type MockTourResolver,
  type MockTourRunner,
} from "@/mocks/tour-runner";
import { useRobotStore } from "@/stores/use-robot-store";
import { toast } from "@/stores/use-toast-store";
import { type TourStorePayload, useTourStore } from "@/stores/use-tour-store";
import type { TourCommand, TourStateSnapshot } from "@/types/ui/tour";
import { useMockMode } from "./use-mock-mode";

const ACK_TIMEOUT_MS = 3000;
const RESTART_POLL_MS = 100;
const RESTART_MAX_WAIT_MS = 5000;

interface UseTourControllerResult {
  /**
   * Send a tour command. Validates client-side first; if invalid (e.g.
   * START when already RUNNING), returns false without contacting robot.
   *
   * Sets optimistic state immediately, then waits for robot ack on
   * /tour/state. Times out after ACK_TIMEOUT_MS by setting state to ERROR.
   */
  sendCommand: (cmd: TourCommand) => boolean;

  /** True if a command is in-flight (state ∈ STARTING|STOPPING). */
  isPending: boolean;

  /**
   * Convenience macro: STOP current tour, wait for IDLE, then START with
   * the same tour or POI list. Used by the "Restart" button.
   *
   * No-op if state is IDLE (just starts fresh). Cancelled if user issues
   * another command before the IDLE handshake completes.
   */
  restart: (start: Extract<TourCommand, { kind: "START" }>) => void;

  /** True if any command is rejected as invalid for current state. */
  canSend: (kind: TourCommand["kind"]) => boolean;
}

/**
 * Snapshot → store shape adapter.
 *
 * TourStateSnapshot (from wire decode) uses `currentPoiId` to match the
 * ROS message field name. The store uses `activePoiId` because that's
 * what existing UI consumers reference. We translate at the boundary.
 */
function snapshotToStorePayload(snap: TourStateSnapshot): TourStorePayload {
  return {
    state: snap.state,
    tourId: snap.tourId,
    tourName: snap.tourName,
    currentPoiIndex: snap.currentPoiIndex,
    totalPois: snap.totalPois,
    activePoiId: snap.currentPoiId,
    activePoiName: snap.currentPoiName,
    activity: snap.activity,
    message: snap.message,
    errorReason: snap.errorReason,
  };
}

/** A START resolved against the mock robot's site (tour or POI list). */
const resolveMockTour: MockTourResolver = (cmd) => {
  const { pois, tours } = getMockRobot().getState();
  const tour = cmd.tourId ? tours.find((t) => t.id === cmd.tourId) : undefined;
  if (cmd.tourId && !tour) return null;
  const stop = (id: string) => {
    const poi = pois.find((p) => p.id === id);
    return poi ? { id, name: poi.name, gesture: poi.gesture !== "" } : null;
  };
  const stops = (tour ? tour.poiIds : cmd.poiIds)
    .map(stop)
    .filter((s) => s !== null);
  return {
    tourId: tour?.id ?? "",
    tourName: tour?.name ?? "",
    stops,
    returnTo: tour?.returnPoiId ? stop(tour.returnPoiId) : null,
  };
};

/* ----------------------------------------------------------------------------
 * Shared state
 *
 * One tour state machine for the whole app: the mock runner (offline) and
 * the timers live here, not per component, so every caller of
 * useTourController() talks to the same tour and navigating between pages
 * never restarts it.
 * ------------------------------------------------------------------------- */

let mockRunner: MockTourRunner | null = null;
let ackTimer: ReturnType<typeof setTimeout> | null = null;
let restartTimer: ReturnType<typeof setTimeout> | null = null;

function applySnapshot(snap: TourStateSnapshot): void {
  // The robot confirmed a non-pending state: the in-flight command has
  // landed (success or rejection), so the ack timeout is moot.
  if (!isPending(snap.state) && ackTimer) {
    clearTimeout(ackTimer);
    ackTimer = null;
  }
  useTourStore.getState().__applySnapshot(snapshotToStorePayload(snap));
}

function clearTimers(): void {
  if (ackTimer) clearTimeout(ackTimer);
  if (restartTimer) clearTimeout(restartTimer);
  ackTimer = null;
  restartTimer = null;
}

/**
 * Send a tour command: validate, set the optimistic state, send to the
 * robot (or the mock runner), arm the ack timeout.
 */
function sendTourCommand(cmd: TourCommand, mock: boolean): boolean {
  // Cancel any restart macro in progress when user issues a manual command.
  if (restartTimer) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }

  const store = useTourStore.getState();
  const current = store.state;
  if (!canTransition(current, cmd.kind)) return false;

  try {
    validateCommand(cmd);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[tour] invalid command:", err);
    return false;
  }

  const optimistic = nextState(current, cmd.kind);
  if (optimistic && optimistic !== current) store.__setOptimistic(optimistic);

  // Send — mock or real. The service answers at once; the state still
  // arrives on /tour/state and wins.
  if (mock) {
    mockRunner?.sendCommand(cmd);
  } else {
    getRos()
      .callService(SERVICES.TOUR_CONTROL, { command: encodeTourCommand(cmd) })
      .then((res) => {
        if (!res.success) {
          toast.warn(`Tour ${cmd.kind.toLowerCase()} refused`, res.message);
        }
      })
      .catch(() => {
        // older robot without /tour/control: fall back to the topic
        getRos().publish(TOPICS.TOUR_CMD, encodeTourCommand(cmd));
      });
  }

  // Arm ack timeout for pending states. The mock answers quickly, so the
  // timeout effectively only matters with a real robot.
  if (optimistic && isPending(optimistic)) {
    if (ackTimer) clearTimeout(ackTimer);
    ackTimer = setTimeout(() => {
      ackTimer = null;
      const latest = useTourStore.getState();
      if (!isPending(latest.state)) return;
      // still pending: the robot did not answer, show it failed
      latest.__applySnapshot({
        state: "ERROR",
        tourId: latest.tourId,
        tourName: latest.tourName,
        currentPoiIndex: latest.currentPoiIndex,
        totalPois: latest.totalPois,
        activePoiId: latest.activePoiId,
        activePoiName: latest.activePoiName,
        activity: "",
        message: "",
        errorReason: "Robot did not acknowledge command in time",
      });
    }, ACK_TIMEOUT_MS);
  }

  return true;
}

/** STOP → wait for IDLE → START (the "Restart" button). */
function restartTour(
  startCmd: Extract<TourCommand, { kind: "START" }>,
  mock: boolean,
): void {
  const current = useTourStore.getState().state;

  // If already idle (or failed), just start.
  if (current === "IDLE" || current === "ERROR") {
    sendTourCommand(startCmd, mock);
    return;
  }

  if (!sendTourCommand({ kind: "STOP" }, mock)) return;

  const startedAt = Date.now();
  const poll = () => {
    restartTimer = null;
    if (useTourStore.getState().state === "IDLE") {
      sendTourCommand(startCmd, mock);
      return;
    }
    if (Date.now() - startedAt > RESTART_MAX_WAIT_MS) return; // gave up
    restartTimer = setTimeout(poll, RESTART_POLL_MS);
  };
  restartTimer = setTimeout(poll, RESTART_POLL_MS);
}

/* ----------------------------------------------------------------------------
 * Hooks
 * ------------------------------------------------------------------------- */

/**
 * Wire the dashboard to the robot-side tour FSM. Mount exactly once, at the
 * top of the provider tree (TourController):
 *   1. subscribe to /tour/state (or run the mock tour offline) into useTourStore
 *   2. call /tour/get_state for the initial snapshot (late join)
 *   3. tick the client-side elapsed counter
 */
export function useTourSync(): void {
  const useMock = useMockMode();
  const epoch = useRobotStore((s) => s.rosEpoch);

  useEffect(() => {
    if (useMock) {
      // one mock FSM that answers the commands of every page
      mockRunner?.shutdown();
      const runner = createMockTourRunner(resolveMockTour);
      mockRunner = runner;
      const unsub = runner.subscribe(applySnapshot);
      return () => {
        unsub();
        runner.shutdown();
        if (mockRunner === runner) mockRunner = null;
      };
    }

    // Real path: subscribe first to avoid missing events while the service
    // call is in flight, then bootstrap with a snapshot.
    void epoch; // re-subscribe on a rebuilt client
    const ros = getRos();
    const unsub = ros.subscribe(TOPICS.TOUR_STATE, (wire: TourStateWire) =>
      applySnapshot(decodeTourState(wire)),
    );

    ros
      .callService(SERVICES.TOUR_GET_STATE, {})
      .then((res) => {
        if (res?.state) applySnapshot(decodeTourState(res.state));
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[tour] get_state snapshot failed:", err);
      });

    return unsub;
  }, [useMock, epoch]);

  useEffect(() => {
    const id = setInterval(() => useTourStore.getState().__tick(), 1000);
    return () => {
      clearInterval(id);
      clearTimers();
    };
  }, []);
}

/**
 * Tour commands for any component. Every caller shares the one tour that
 * useTourSync runs; calling this hook starts nothing by itself.
 */
export function useTourController(): UseTourControllerResult {
  const useMock = useMockMode();
  const state = useTourStore((s) => s.state);

  const sendCommand = useCallback(
    (cmd: TourCommand) => sendTourCommand(cmd, useMock),
    [useMock],
  );
  const restart = useCallback(
    (startCmd: Extract<TourCommand, { kind: "START" }>) =>
      restartTour(startCmd, useMock),
    [useMock],
  );
  const canSend = useCallback(
    (kind: TourCommand["kind"]) =>
      canTransition(useTourStore.getState().state, kind),
    [],
  );

  return { sendCommand, isPending: isPending(state), restart, canSend };
}
