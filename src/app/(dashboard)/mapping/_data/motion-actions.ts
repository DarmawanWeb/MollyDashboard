import type { MotionAction } from "@/types";

/**
 * Display options for the motion-action select.
 *
 * Kept colocated with the mapping page because no other route picks motion
 * actions. If teleop ever exposes the same set, move to /data/ at src root.
 */
export const MOTION_ACTIONS: ReadonlyArray<{
  value: MotionAction;
  label: string;
}> = [
  { value: "none", label: "No motion" },
  { value: "wave", label: "Wave" },
  { value: "bow", label: "Bow" },
  { value: "sit", label: "Sit" },
  { value: "stand", label: "Stand" },
  { value: "dance", label: "Dance" },
];
