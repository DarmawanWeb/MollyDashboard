/**
 * ROS 2 std_msgs/* message shapes.
 * @see https://docs.ros2.org/latest/api/std_msgs/index-msg.html
 */

export interface RosHeader {
  stamp: { sec: number; nanosec: number };
  frame_id: string;
}

export type StdEmpty = Record<string, never>;

export interface StdString {
  data: string;
}

export interface StdBool {
  data: boolean;
}

export interface StdInt32 {
  data: number;
}

export interface StdFloat32 {
  data: number;
}

export interface StdFloat64 {
  data: number;
}

/* ----------------------------------------------------------------------------
 * std_srvs/*
 * ------------------------------------------------------------------------- */

/** std_srvs/srv/Trigger request */
export type TriggerRequest = Record<string, never>;

/** std_srvs/srv/SetBool request */
export interface SetBoolRequest {
  data: boolean;
}

/** std_srvs/srv/Trigger and std_srvs/srv/SetBool response */
export interface TriggerResponse {
  success: boolean;
  message: string;
}
