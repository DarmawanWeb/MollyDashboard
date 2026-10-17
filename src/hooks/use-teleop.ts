"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RobotApi } from "@/types/ui";

const PUBLISH_INTERVAL_MS = 100;

export type TeleopDirection =
  | "forward"
  | "backward"
  | "left"
  | "right"
  | "turn_left"
  | "turn_right";

interface Velocities {
  /** m/s */
  linearVel: number;
  /** m/s sideways */
  lateralVel: number;
  /** rad/s */
  angularVel: number;
}

interface UseTeleopResult {
  /** Currently held direction, or null if idle */
  held: TeleopDirection | null;
  /** Start driving in `direction` until release */
  startHold: (direction: TeleopDirection) => void;
  /** End the hold (key up): stop publishing and send zero */
  release: () => void;
  /** Send zero velocity now */
  stop: () => void;
}

/** Body-frame velocity of a held direction (x forward, y left, yaw CCW). */
function velocityOf(
  dir: TeleopDirection,
  v: Velocities,
): [number, number, number] {
  switch (dir) {
    case "forward":
      return [v.linearVel, 0, 0];
    case "backward":
      return [-v.linearVel, 0, 0];
    case "left":
      return [0, v.lateralVel, 0];
    case "right":
      return [0, -v.lateralVel, 0];
    case "turn_left":
      return [0, 0, v.angularVel];
    case "turn_right":
      return [0, 0, -v.angularVel];
  }
}

/**
 * Press-and-hold teleop through the control mux (/bridge/remote_cmd_vel).
 *
 * While held, the velocity is sent every PUBLISH_INTERVAL_MS (the mux zeroes
 * the robot when teleop goes silent); a pointer release anywhere on the
 * window, the window losing focus or `release()` (key up) sends zero.
 * Unmounting always stops the robot. Only effective in REMOTE mode.
 */
export function useTeleop(
  api: RobotApi,
  velocities: Velocities,
): UseTeleopResult {
  const [held, setHeld] = useState<TeleopDirection | null>(null);

  const velRef = useRef(velocities);
  useEffect(() => {
    velRef.current = velocities;
  }, [velocities]);

  const apiRef = useRef(api);
  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const releaseRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    apiRef.current.drive(0, 0, 0);
  }, []);

  const startHold = useCallback(
    (dir: TeleopDirection) => {
      releaseRef.current?.();

      const send = () => {
        const [vx, vy, wz] = velocityOf(dir, velRef.current);
        apiRef.current.drive(vx, vy, wz);
      };
      setHeld(dir);
      send();
      intervalRef.current = setInterval(send, PUBLISH_INTERVAL_MS);

      const release = () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        stop();
        setHeld(null);
        window.removeEventListener("pointerup", release);
        window.removeEventListener("pointercancel", release);
        window.removeEventListener("blur", release);
        releaseRef.current = null;
      };

      releaseRef.current = release;
      window.addEventListener("pointerup", release);
      window.addEventListener("pointercancel", release);
      window.addEventListener("blur", release);
    },
    [stop],
  );

  const release = useCallback(() => releaseRef.current?.(), []);

  // Safety: navigating away always stops the robot
  useEffect(() => () => releaseRef.current?.(), []);

  return { held, startHold, release, stop };
}
