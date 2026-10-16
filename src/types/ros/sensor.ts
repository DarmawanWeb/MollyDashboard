/**
 * ROS 2 sensor_msgs/* message shapes.
 * @see https://docs.ros2.org/latest/api/sensor_msgs/index-msg.html
 */

import type { RosHeader } from "./std";

export interface Image {
  header: RosHeader;
  height: number;
  width: number;
  encoding: string;
  is_bigendian: number;
  step: number;
  /** base64-encoded over rosbridge */
  data: string;
}

export interface CompressedImage {
  header: RosHeader;
  /** e.g. "jpeg", "png" */
  format: string;
  /** base64-encoded over rosbridge */
  data: string;
}

export interface LaserScan {
  header: RosHeader;
  angle_min: number;
  angle_max: number;
  angle_increment: number;
  time_increment: number;
  scan_time: number;
  range_min: number;
  range_max: number;
  ranges: number[];
  intensities: number[];
}

export interface BatteryState {
  header: RosHeader;
  voltage: number;
  temperature: number;
  current: number;
  charge: number;
  capacity: number;
  design_capacity: number;
  /** 0..1 */
  percentage: number;
  power_supply_status: number;
  power_supply_health: number;
  power_supply_technology: number;
  present: boolean;
}

export interface JointState {
  header: RosHeader;
  name: string[];
  position: number[];
  velocity: number[];
  effort: number[];
}

export interface Imu {
  header: RosHeader;
  orientation: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  orientation_covariance: number[];
  angular_velocity: { x: number; y: number; z: number };
  angular_velocity_covariance: number[];
  linear_acceleration: { x: number; y: number; z: number };
  linear_acceleration_covariance: number[];
}
