"use client";
import { useEffect, useRef, useState } from "react";
import { getRos, type TopicDef } from "@/lib/ros";
import { useRobotStore } from "@/stores/use-robot-store";

/**
 * Subscribe to a typed ROS topic.
 *
 * Usage:
 *   const odom = useRosTopic(TOPICS.ODOM, null);
 */
export function useRosTopic<TMsg>(topic: TopicDef<TMsg>, initial: TMsg): TMsg {
  const [data, setData] = useState<TMsg>(initial);

  useEffect(() => {
    const unsub = getRos().subscribe(topic, setData);
    return unsub;
  }, [topic]);

  return data;
}

/* ----------------------------------------------------------------------------
 * Robot motion simulation
 *
 * Simulates a slow random walk in the ROS map frame (meters, not pixels).
 * Bounds match the mock grid extent so the robot stays visible on the map.
 * Tick rate is 100ms with ~5cm/step → looks like a robot exploring.
 * ------------------------------------------------------------------------- */

// Mock grid is 120 × 100 cells at 0.05m/cell with origin (-3, -2.5).
// World extent: x ∈ [-3, 3], y ∈ [-2.5, 2.5]. We keep the robot a bit
// inside that so it doesn't get clipped to the edge.
const SIM_BOUNDS = {
  minX: -2.5,
  maxX: 2.5,
  minY: -2.0,
  maxY: 2.0,
};

const SIM_STEP_METERS = 0.05;
const SIM_YAW_JITTER = 0.06; // radians per tick

export function useRobotSimulation(active: boolean) {
  const setPose = useRobotStore((s) => s.setPose);

  useEffect(() => {
    if (!active) return;

    const id = setInterval(() => {
      const pose = useRobotStore.getState().pose;
      const yaw = pose.yaw + (Math.random() - 0.5) * SIM_YAW_JITTER;
      let x = pose.x + Math.cos(yaw) * SIM_STEP_METERS;
      let y = pose.y + Math.sin(yaw) * SIM_STEP_METERS;

      // Reflect at bounds rather than clamping — clamped robot would hug
      // the wall forever. Reflection makes it wander back into view.
      let nextYaw = yaw;
      if (x < SIM_BOUNDS.minX || x > SIM_BOUNDS.maxX) {
        x = Math.max(SIM_BOUNDS.minX, Math.min(SIM_BOUNDS.maxX, x));
        nextYaw = Math.PI - yaw;
      }
      if (y < SIM_BOUNDS.minY || y > SIM_BOUNDS.maxY) {
        y = Math.max(SIM_BOUNDS.minY, Math.min(SIM_BOUNDS.maxY, y));
        nextYaw = -yaw;
      }

      setPose({ x, y, yaw: nextYaw });
    }, 100);

    return () => clearInterval(id);
  }, [active, setPose]);
}

const FSM_STATES = [
  "NAVIGATING",
  "NARRATING",
  "INTERACTING",
  "NAVIGATING",
  "PERFORMING",
] as const;

/** Simulates FSM state cycling. */
export function useFSMSimulation(active: boolean) {
  const setFSM = useRobotStore((s) => s.setFSM);
  const idx = useRef(0);

  useEffect(() => {
    if (!active) return;
    const i = setInterval(() => {
      idx.current = (idx.current + 1) % FSM_STATES.length;
      setFSM(FSM_STATES[idx.current]);
    }, 8000);
    return () => clearInterval(i);
  }, [active, setFSM]);
}

/** Ticking timer (uptime, tour elapsed, etc.). */
export function useTicker(active: boolean, start = 0): number {
  const [v, setV] = useState(start);
  useEffect(() => {
    if (!active) return;
    const i = setInterval(() => setV((x) => x + 1), 1000);
    return () => clearInterval(i);
  }, [active]);
  return v;
}

export function formatUptime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
