"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRos, makeTwist2D, STOP_TWIST, TOPICS } from "@/lib/ros";

const PUBLISH_INTERVAL_MS = 100;

export type TeleopDirection = "fwd" | "back" | "left" | "right";

interface UseTeleopHoldArgs {
  linearVel: number;
  angularVel: number;
}

interface UseTeleopHoldReturn {
  /** Currently held direction, or null if idle */
  held: TeleopDirection | null;
  /** Start publishing for `direction` until release */
  startHold: (direction: TeleopDirection) => void;
  /** Publish a single stop command (for E-stop button) */
  publishStop: () => void;
}

/**
 * Manages press-and-hold teleop publishing.
 *
 * On mouse/touch down: publish the chosen Twist at PUBLISH_INTERVAL_MS until
 * the user releases (mouseup/touchend anywhere on window). On release, sends
 * a single STOP_TWIST to halt the robot.
 *
 * Why an interval rather than one-shot publish: navigation stacks expect
 * cmd_vel at a steady rate (typically 10-20Hz). A single message would be
 * applied for one tick then the watchdog would zero it.
 *
 * Cleanup on unmount: clears any running interval and removes window
 * listeners. Always sends a final STOP_TWIST so a navigating page never
 * leaves the robot moving.
 */
export function useTeleopHold({
  linearVel,
  angularVel,
}: UseTeleopHoldArgs): UseTeleopHoldReturn {
  const [held, setHeld] = useState<TeleopDirection | null>(null);

  // ref to avoid stale closures inside the interval / event handlers
  const velsRef = useRef({ linearVel, angularVel });
  useEffect(() => {
    velsRef.current = { linearVel, angularVel };
  }, [linearVel, angularVel]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const releaseRef = useRef<(() => void) | null>(null);

  const publishFor = useCallback((dir: TeleopDirection) => {
    const { linearVel: lv, angularVel: av } = velsRef.current;
    const twist =
      dir === "fwd"
        ? makeTwist2D(lv, 0)
        : dir === "back"
          ? makeTwist2D(-lv, 0)
          : dir === "left"
            ? makeTwist2D(0, av)
            : makeTwist2D(0, -av);
    getRos().publish(TOPICS.CMD_VEL, twist);
  }, []);

  const publishStop = useCallback(() => {
    getRos().publish(TOPICS.CMD_VEL, STOP_TWIST);
  }, []);

  const startHold = useCallback(
    (dir: TeleopDirection) => {
      // tear down any previous hold (defensive — should already be released)
      releaseRef.current?.();

      setHeld(dir);
      publishFor(dir);
      intervalRef.current = setInterval(
        () => publishFor(dir),
        PUBLISH_INTERVAL_MS,
      );

      const release = () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        publishStop();
        setHeld(null);
        window.removeEventListener("mouseup", release);
        window.removeEventListener("touchend", release);
        releaseRef.current = null;
      };

      releaseRef.current = release;
      window.addEventListener("mouseup", release);
      window.addEventListener("touchend", release);
    },
    [publishFor, publishStop],
  );

  // Safety: clean up on unmount so navigating away always stops the robot
  useEffect(() => {
    return () => {
      releaseRef.current?.();
    };
  }, []);

  return { held, startHold, publishStop };
}
