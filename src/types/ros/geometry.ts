/**
 * ROS 2 geometry_msgs/* message shapes.
 * @see https://docs.ros2.org/latest/api/geometry_msgs/index-msg.html
 */

import type { RosHeader } from "./std";

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Point {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Pose {
  position: Point;
  orientation: Quaternion;
}

export interface PoseStamped {
  header: RosHeader;
  pose: Pose;
}

export interface PoseWithCovariance {
  pose: Pose;
  /** 6x6 row-major matrix */
  covariance: number[];
}

export interface PoseWithCovarianceStamped {
  header: RosHeader;
  pose: PoseWithCovariance;
}

export interface Twist {
  linear: Vector3;
  angular: Vector3;
}

export interface TwistStamped {
  header: RosHeader;
  twist: Twist;
}

export interface Transform {
  translation: Vector3;
  rotation: Quaternion;
}

export interface TransformStamped {
  header: RosHeader;
  child_frame_id: string;
  transform: Transform;
}
