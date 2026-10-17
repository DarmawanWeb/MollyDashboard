"use client";
import { useEffect, useState } from "react";
import { getRos, type TopicDef } from "@/lib/ros";
import { useRobotStore } from "@/stores/use-robot-store";

/**
 * Subscribe to a typed ROS topic; re-subscribes when the client is rebuilt.
 *
 * Usage:
 *   const status = useRosTopic(TOPICS.ODOMETRY_STATUS, { data: "" });
 */
export function useRosTopic<TMsg>(
  topic: TopicDef<TMsg>,
  initial: TMsg,
  options?: { throttleMs?: number; enabled?: boolean },
): TMsg {
  const [data, setData] = useState<TMsg>(initial);
  const epoch = useRobotStore((s) => s.rosEpoch);
  const throttleMs = options?.throttleMs;
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;
    void epoch; // re-subscribe on a rebuilt client
    return getRos().subscribe(topic, setData, { throttleMs });
  }, [topic, throttleMs, enabled, epoch]);

  return data;
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
