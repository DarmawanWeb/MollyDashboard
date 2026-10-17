/**
 * Wire format of lite3_interfaces (Deep Robotics Lite3 driver, lite3_ros2).
 *
 * Robot specific and optional: a Molly robot with another base simply never
 * publishes /<robot_ns>/state, and the dashboard hides the Lite3 details.
 */

import type { RosHeader } from "./std";

/** lite3_interfaces/msg/RobotState */
export interface Lite3RobotStateWire {
  header: RosHeader;
  /** a state datagram arrived from the motion host within the timeout */
  connected: boolean;
  age_sec: number;
  basic_state: number;
  /** sitting, standing, standing_up, sitting_down, protection, ... */
  basic_state_name: string;
  gait_state: number;
  /** flat_slow, flat_medium, flat_fast, rug_general, rug_grip, ... */
  gait_name: string;
  policy_state: number;
  motion_state: number;
  motion_name: string;
  standing: boolean;
  moving: boolean;
  balance_lost: boolean;
  zeroed: boolean;
  /** 0..1 */
  battery: number;
  /** m, 0.28..4.5 */
  ultrasound_front: number;
  ultrasound_rear: number;
  /** navigation | manual | unknown */
  control_mode: string;
  /** running gesture, empty when none */
  gesture: string;
  /** struct layout of the motion host's state datagram */
  layout: string;
}
