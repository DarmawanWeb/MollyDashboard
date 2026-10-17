/**
 * rcl_interfaces/msg/Log (/rosout) → log viewer entries.
 */

import type { RosLog } from "@/types/ros/rcl";
import type { LogEntry, LogLevel } from "@/types/ui";

/** rcl_interfaces Log levels: 10 DEBUG, 20 INFO, 30 WARN, 40 ERROR, 50 FATAL. */
export function logLevel(level: number): LogLevel {
  if (level >= 50) return "fatal";
  if (level >= 40) return "error";
  if (level >= 30) return "warn";
  if (level >= 20) return "info";
  return "debug";
}

export function logFromRosout(msg: RosLog, id: number): LogEntry {
  const ms = msg.stamp.sec * 1000 + Math.floor(msg.stamp.nanosec / 1e6);
  return {
    id,
    timestamp: new Date(ms || Date.now()).toLocaleTimeString("en-GB", {
      hour12: false,
    }),
    level: logLevel(msg.level),
    node: msg.name.startsWith("/") ? msg.name : `/${msg.name}`,
    message: msg.msg,
  };
}
