import type { FSMStateInfo, FSMStateKey } from "@/types";

/**
 * FSM visual metadata.
 */
/**
 * Centralized FSM styling + labels.
 */
export const FSM_STATES: Record<FSMStateKey, FSMStateInfo> = {
  IDLE: {
    label: "Idle",
    bgClass: "bg-zinc-500/10",
    borderClass: "border-zinc-500/30",
    dotClass: "bg-zinc-400",
    textClass: "text-zinc-300",
  },

  BOOTING: {
    label: "Booting",
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/30",
    dotClass: "bg-yellow-400",
    textClass: "text-yellow-300",
  },

  LOCALIZING: {
    label: "Localizing",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    dotClass: "bg-blue-400",
    textClass: "text-blue-300",
  },

  NAVIGATING: {
    label: "Navigating",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/30",
    dotClass: "bg-cyan-400",
    textClass: "text-cyan-300",
  },

  NARRATING: {
    label: "Narrating",
    bgClass: "bg-violet-500/10",
    borderClass: "border-violet-500/30",
    dotClass: "bg-violet-400",
    textClass: "text-violet-300",
  },

  INTERACTING: {
    label: "Interacting",
    bgClass: "bg-pink-500/10",
    borderClass: "border-pink-500/30",
    dotClass: "bg-pink-400",
    textClass: "text-pink-300",
  },

  PERFORMING: {
    label: "Performing",
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-500/30",
    dotClass: "bg-orange-400",
    textClass: "text-orange-300",
  },

  OBSTACLE_BLOCKED: {
    label: "Blocked",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
    dotClass: "bg-red-400",
    textClass: "text-red-300",
  },

  RETURNING: {
    label: "Returning",
    bgClass: "bg-teal-500/10",
    borderClass: "border-teal-500/30",
    dotClass: "bg-teal-400",
    textClass: "text-teal-300",
  },

  ESTOP: {
    label: "E-STOP",
    bgClass: "bg-red-600/15",
    borderClass: "border-red-600/40",
    dotClass: "bg-red-500",
    textClass: "text-red-400",
  },
};
