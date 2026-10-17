import type { ActivityStyle, RobotActivityKey } from "@/types";

/**
 * Centralized robot activity styling + labels (status badges).
 */
export const ACTIVITY_STATES: Record<RobotActivityKey, ActivityStyle> = {
  OFFLINE: {
    label: "Offline",
    bgClass: "bg-zinc-500/10",
    borderClass: "border-zinc-500/30",
    dotClass: "bg-zinc-500",
    textClass: "text-zinc-400",
  },

  IDLE: {
    label: "Idle",
    bgClass: "bg-zinc-500/10",
    borderClass: "border-zinc-500/30",
    dotClass: "bg-zinc-400",
    textClass: "text-zinc-300",
  },

  REMOTE: {
    label: "Remote control",
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/30",
    dotClass: "bg-yellow-400",
    textClass: "text-yellow-300",
  },

  MAPPING: {
    label: "Mapping",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    dotClass: "bg-blue-400",
    textClass: "text-blue-300",
  },

  WALKING: {
    label: "Walking",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/30",
    dotClass: "bg-cyan-400",
    textClass: "text-cyan-300",
  },

  BLOCKED: {
    label: "Blocked",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
    dotClass: "bg-red-400",
    textClass: "text-red-300",
  },

  TOURING: {
    label: "Guiding",
    bgClass: "bg-teal-500/10",
    borderClass: "border-teal-500/30",
    dotClass: "bg-teal-400",
    textClass: "text-teal-300",
  },

  NARRATING: {
    label: "Narrating",
    bgClass: "bg-violet-500/10",
    borderClass: "border-violet-500/30",
    dotClass: "bg-violet-400",
    textClass: "text-violet-300",
  },

  PERFORMING: {
    label: "Gesture",
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-500/30",
    dotClass: "bg-orange-400",
    textClass: "text-orange-300",
  },

  WAITING: {
    label: "Waiting for visitors",
    bgClass: "bg-pink-500/10",
    borderClass: "border-pink-500/30",
    dotClass: "bg-pink-400",
    textClass: "text-pink-300",
  },

  ESTOP: {
    label: "E-STOP",
    bgClass: "bg-red-600/15",
    borderClass: "border-red-600/40",
    dotClass: "bg-red-500",
    textClass: "text-red-400",
  },
};
