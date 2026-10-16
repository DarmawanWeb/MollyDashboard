"use client";

import { type ReactNode, useEffect } from "react";
import { env } from "@/lib/env";
import { configureRos, getRos } from "@/lib/ros";
import { useRobotStore } from "@/stores/use-robot-store";

/**
 * Single responsibility: open the rosbridge connection on mount, tear it
 * down on unmount, and sync connection status into the robot store.
 *
 * Mount this once at the top of the dashboard tree. Subscribers further
 * down call `getRos().subscribe(...)` without caring about lifecycle.
 */
export function ConnectionProvider({ children }: { children: ReactNode }) {
  const setConnection = useRobotStore((s) => s.setConnection);

  useEffect(() => {
    // configure singleton with current URL — idempotent for same URL,
    // tears down and reconnects if URL changed (e.g. Settings update)
    configureRos({ url: env.ROSBRIDGE_URL });

    const ros = getRos();
    ros.connect();

    const unsub = ros.onStatusChange(setConnection);
    return () => {
      unsub();
      // Note: we deliberately do NOT call ros.disconnect() here.
      // The singleton outlives this provider's mount cycle (React strict
      // mode would otherwise tear down and immediately rebuild the socket).
      // Reload the page to force a clean reconnect.
    };
  }, [setConnection]);

  return <>{children}</>;
}
