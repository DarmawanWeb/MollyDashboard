/**
 * Robot driver commands (std_srvs/Trigger under the robot namespace) offered
 * as buttons. Names follow lite3_ros2; other robots may offer fewer.
 */
export const POSTURE_ACTIONS = [
  { command: "stand_up", label: "Stand up" },
  { command: "sit_down", label: "Sit down" },
] as const;

export const GAIT_ACTIONS = [
  { command: "gait_slow", label: "Slow" },
  { command: "gait_medium", label: "Medium" },
  { command: "gait_fast", label: "Fast" },
] as const;
