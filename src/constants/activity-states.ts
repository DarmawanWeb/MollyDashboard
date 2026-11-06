import type { ActivityStyle, RobotActivityKey } from "@/types";

/**
 * Robot activity styling + labels (operator status badges). Colors are
 * theme tokens, so the badges read well in light and dark mode. Class names
 * are written out in full: Tailwind only generates classes it can see.
 */
const TONES = {
  neutral: {
    bgClass: "bg-mol-tertiary",
    borderClass: "border-border",
    dotClass: "bg-txt-muted",
    textClass: "text-txt-secondary",
  },
  amber: {
    bgClass: "bg-amber/10",
    borderClass: "border-amber/30",
    dotClass: "bg-amber",
    textClass: "text-amber",
  },
  violet: {
    bgClass: "bg-violet/10",
    borderClass: "border-violet/30",
    dotClass: "bg-violet",
    textClass: "text-violet",
  },
  cyan: {
    bgClass: "bg-cyan/10",
    borderClass: "border-cyan/30",
    dotClass: "bg-cyan",
    textClass: "text-cyan",
  },
  red: {
    bgClass: "bg-red/10",
    borderClass: "border-red/30",
    dotClass: "bg-red",
    textClass: "text-red",
  },
  green: {
    bgClass: "bg-green/10",
    borderClass: "border-green/30",
    dotClass: "bg-green",
    textClass: "text-green",
  },
  orange: {
    bgClass: "bg-orange/10",
    borderClass: "border-orange/30",
    dotClass: "bg-orange",
    textClass: "text-orange",
  },
} satisfies Record<string, Omit<ActivityStyle, "label">>;

export const ACTIVITY_STATES: Record<RobotActivityKey, ActivityStyle> = {
  OFFLINE: {
    label: "Offline",
    ...TONES.neutral,
    textClass: "text-txt-tertiary",
  },
  IDLE: { label: "Idle", ...TONES.neutral },
  REMOTE: { label: "Remote control", ...TONES.amber },
  MAPPING: { label: "Mapping", ...TONES.violet },
  WALKING: { label: "Walking", ...TONES.cyan },
  BLOCKED: { label: "Blocked", ...TONES.red },
  TOURING: { label: "Guiding", ...TONES.green },
  NARRATING: { label: "Narrating", ...TONES.violet },
  PERFORMING: { label: "Gesture", ...TONES.orange },
  WAITING: { label: "Waiting for visitors", ...TONES.amber },
  ESTOP: { label: "E-STOP", ...TONES.red },
};
