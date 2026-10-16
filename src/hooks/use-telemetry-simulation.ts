"use client";

import { useEffect } from "react";
import { useRobotStore } from "@/stores/use-robot-store";

const TICK_MS = 3000;

/**
 * Periodically jitters robot telemetry (temp, CPU, RAM, velocity, IMU) so
 * the dashboard charts and gauges have believable motion when no real
 * ROS data is flowing.
 *
 * No-op when `active` is false. Cheap to leave mounted.
 */
export function useTelemetrySimulation(active: boolean): void {
  const setState = useRobotStore((s) => s.setState);

  useEffect(() => {
    if (!active) return;

    const id = setInterval(() => {
      const t = Date.now() / 3000;
      setState({
        cpu_temp: 42 + Math.round(Math.sin(t) * 4),
        gpu_temp: 38 + Math.round(Math.cos(t) * 3),
        cpu_usage: 30 + Math.round(Math.sin(t * 0.7) * 8),
        gpu_usage: 18 + Math.round(Math.cos(t * 0.5) * 6),
        ram_used_gb: round1(6.0 + Math.sin(t * 0.3) * 0.5),
        velocity: {
          linear: round2(0.35 + Math.sin(t) * 0.1),
          angular: round3(0.02 + Math.cos(t) * 0.01),
        },
        imu: {
          roll: round1(0.8 + Math.sin(t) * 0.3),
          pitch: round1(1.2 + Math.cos(t) * 0.4),
          yaw: round1(45.3 + t * 0.5),
        },
      });
    }, TICK_MS);

    return () => clearInterval(id);
  }, [active, setState]);
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;
const round3 = (n: number) => Math.round(n * 1000) / 1000;
