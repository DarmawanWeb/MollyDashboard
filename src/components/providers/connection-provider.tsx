"use client";

import { type ReactNode, useEffect } from "react";
import { env } from "@/lib/env";
import { configureRos, getRos } from "@/lib/ros";
import { useRobotStore } from "@/stores/use-robot-store";
import { useSettingsStore } from "@/stores/use-settings-store";

/**
 * Single responsibility: open the rosbridge connection with the configured
 * URL and robot namespace, rebuild it when Settings change them, and sync
 * the connection status into the robot store.
 *
 * Mount this once at the top of the dashboard tree. Subscribers further
 * down call `getRos().subscribe(...)` without caring about lifecycle; the
 * sync hooks re-subscribe when `rosEpoch` changes.
 */
export function ConnectionProvider({ children }: { children: ReactNode }) {
  const setConnection = useRobotStore((s) => s.setConnection);
  const bumpRosEpoch = useRobotStore((s) => s.bumpRosEpoch);
  const rosbridgeUrl = useSettingsStore((s) => s.connection.rosbridgeUrl);
  const robotNamespace = useSettingsStore((s) => s.connection.robotNamespace);

  useEffect(() => {
    const before = getRos();
    // idempotent for the same URL + namespace; otherwise tears down and
    // rebuilds the singleton
    const ros = configureRos({
      url: rosbridgeUrl || env.ROSBRIDGE_URL,
      robotNamespace,
    });
    if (ros !== before) bumpRosEpoch();
    ros.connect();

    const unsub = ros.onStatusChange(setConnection);
    return () => {
      unsub();
      // Note: we deliberately do NOT call ros.disconnect() here.
      // The singleton outlives this provider's mount cycle (React strict
      // mode would otherwise tear down and immediately rebuild the socket).
    };
  }, [rosbridgeUrl, robotNamespace, setConnection, bumpRosEpoch]);

  return <>{children}</>;
}
