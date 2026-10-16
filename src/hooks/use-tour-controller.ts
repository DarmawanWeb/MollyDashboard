"use client";

import { useCallback, useEffect, useRef } from "react";
import { env } from "@/lib/env";
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
import { createMockTourRunner } from "@/mocks/tour-runner";
import { useRobotStore } from "@/stores/use-robot-store";
import { useTourStore } from "@/stores/use-tour-store";
import type { TourCommand, TourStateSnapshot } from "@/types/ui/tour";

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
   * the same POI list. Used by the "Restart" button.
   *
   * No-op if state is IDLE (just starts fresh). Cancelled if user issues
   * another command before the IDLE handshake completes.
   */
  restart: (poiIds: string[]) => void;

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
function snapshotToStorePayload(snap: TourStateSnapshot) {
  return {
    state: snap.state,
    currentPoiIndex: snap.currentPoiIndex,
    totalPois: snap.totalPois,
    activePoiId: snap.currentPoiId,
    activity: snap.activity,
    errorReason: snap.errorReason,
  };
}

/**
 * Wire the dashboard to the robot-side tour FSM.
 *
 * On mount:
 *   1. Subscribe to /tour/state and pipe into useTourStore
 *   2. Call /tour/get_state for initial snapshot (handles late-join)
 *   3. Start 1Hz client-side ticker for elapsed counter
 *
 * On unmount: tears down subscription, clears any pending timers, and
 * (in mock mode) shuts down the mock runner.
 *
 * Should be mounted exactly once at the top of the provider tree.
 */
export function useTourController(): UseTourControllerResult {
  const apply = useTourStore((s) => s.__applySnapshot);
  const setOptimistic = useTourStore((s) => s.__setOptimistic);
  const tick = useTourStore((s) => s.__tick);
  const connection = useRobotStore((s) => s.connectionStatus);

  /** Stash latest store state in a ref so handlers don't recreate on every change. */
  const latestStateRef = useRef(useTourStore.getState());
  useEffect(() => {
    const unsub = useTourStore.subscribe((s) => {
      latestStateRef.current = s;
    });
    return unsub;
  }, []);

  const ackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mock runner lifetime tied to mock mode being active.
  const offline = connection === "disconnected";
  const useMock = env.USE_MOCKS || offline;
  const mockRef = useRef<ReturnType<typeof createMockTourRunner> | null>(null);

  /* ------------------------------------------------------------------------
   * Reconciliation — clear pending-ack timer when robot confirms a state
   *
   * Defined BEFORE the subscription effect because that effect calls it.
   * (Biome's useExhaustiveDependencies enforces declaration order.)
   * --------------------------------------------------------------------- */

  const reconcile = useCallback((snap: TourStateSnapshot) => {
    // If robot confirmed a non-pending state, the in-flight command has
    // landed (success or rejection) — clear the timeout.
    if (!isPending(snap.state) && ackTimerRef.current) {
      clearTimeout(ackTimerRef.current);
      ackTimerRef.current = null;
    }
  }, []);

  /* ------------------------------------------------------------------------
   * Wire up state stream (real or mocked)
   * --------------------------------------------------------------------- */

  useEffect(() => {
    if (useMock) {
      // Mock path: create local FSM that responds to commands sent via
      // sendCommand (see below). Subscription emits initial state immediately.
      if (mockRef.current) mockRef.current.shutdown();
      mockRef.current = createMockTourRunner();
      const unsub = mockRef.current.subscribe((snap) => {
        reconcile(snap);
        apply(snapshotToStorePayload(snap));
      });
      return () => {
        unsub();
        mockRef.current?.shutdown();
        mockRef.current = null;
      };
    }

    // Real path: subscribe first to avoid missing events while the service
    // call is in flight, then bootstrap with a snapshot.
    const ros = getRos();
    const handleWire = (wire: TourStateWire) => {
      const snap = decodeTourState(wire);
      reconcile(snap);
      apply(snapshotToStorePayload(snap));
    };
    const unsub = ros.subscribe(TOPICS.TOUR_STATE, handleWire);

    ros
      .callService(SERVICES.TOUR_GET_STATE, {})
      .then((res) => {
        if (!res?.state) return;
        const snap = decodeTourState(res.state);
        reconcile(snap);
        apply(snapshotToStorePayload(snap));
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[tour] get_state snapshot failed:", err);
      });

    return () => {
      unsub();
    };
  }, [useMock, apply, reconcile]);

  /* ------------------------------------------------------------------------
   * Client-side elapsed-time ticker
   * --------------------------------------------------------------------- */

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  /* ------------------------------------------------------------------------
   * Command sending
   * --------------------------------------------------------------------- */

  const sendCommand = useCallback(
    (cmd: TourCommand): boolean => {
      // Cancel any restart macro in progress when user issues a manual command.
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }

      const current = latestStateRef.current.state;
      if (!canTransition(current, cmd.kind)) {
        return false;
      }

      try {
        validateCommand(cmd);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[tour] invalid command:", err);
        return false;
      }

      const optimistic = nextState(current, cmd.kind);
      if (optimistic && optimistic !== current) {
        setOptimistic(optimistic);
      }

      // Publish — mock or real
      if (useMock) {
        mockRef.current?.sendCommand(cmd);
      } else {
        getRos().publish(TOPICS.TOUR_CMD, encodeTourCommand(cmd));
      }

      // Arm ack timeout for pending states. Mock will respond quickly so
      // the timeout effectively only matters in real mode.
      if (optimistic && isPending(optimistic)) {
        if (ackTimerRef.current) clearTimeout(ackTimerRef.current);
        ackTimerRef.current = setTimeout(() => {
          ackTimerRef.current = null;
          // If we're still pending after the timeout, robot didn't respond.
          // Mark as ERROR so user sees something failed.
          const latest = latestStateRef.current;
          if (isPending(latest.state)) {
            apply({
              state: "ERROR",
              currentPoiIndex: latest.currentPoiIndex,
              totalPois: latest.totalPois,
              activePoiId: latest.activePoiId,
              activity: "",
              errorReason: "Robot did not acknowledge command in time",
            });
          }
        }, ACK_TIMEOUT_MS);
      }

      return true;
    },
    [apply, setOptimistic, useMock],
  );

  /* ------------------------------------------------------------------------
   * Restart macro: STOP → wait for IDLE → START
   * --------------------------------------------------------------------- */

  const restart = useCallback(
    (poiIds: string[]) => {
      const current = latestStateRef.current.state;
      const startCmd: TourCommand = { kind: "START", poiIds };

      // If already idle, just start. If error, also just start.
      if (current === "IDLE" || current === "ERROR") {
        sendCommand(startCmd);
        return;
      }

      // Otherwise stop first, then poll for IDLE.
      const stopped = sendCommand({ kind: "STOP" });
      if (!stopped) return;

      const startedAt = Date.now();
      const poll = () => {
        restartTimerRef.current = null;
        if (latestStateRef.current.state === "IDLE") {
          sendCommand(startCmd);
          return;
        }
        if (Date.now() - startedAt > RESTART_MAX_WAIT_MS) {
          // give up — robot didn't reach IDLE
          return;
        }
        restartTimerRef.current = setTimeout(poll, RESTART_POLL_MS);
      };
      restartTimerRef.current = setTimeout(poll, RESTART_POLL_MS);
    },
    [sendCommand],
  );

  /* ------------------------------------------------------------------------
   * Cleanup on unmount
   * --------------------------------------------------------------------- */

  useEffect(
    () => () => {
      if (ackTimerRef.current) clearTimeout(ackTimerRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    },
    [],
  );

  /* ------------------------------------------------------------------------
   * Exposed API
   * --------------------------------------------------------------------- */

  const canSend = useCallback(
    (kind: TourCommand["kind"]) =>
      canTransition(latestStateRef.current.state, kind),
    [],
  );

  return {
    sendCommand,
    isPending: isPending(latestStateRef.current.state),
    restart,
    canSend,
  };
}
