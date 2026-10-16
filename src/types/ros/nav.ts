/**
 * ROS 2 nav_msgs/* message shapes.
 * @see https://docs.ros2.org/latest/api/nav_msgs/index-msg.html
 */

import type { Pose, PoseStamped, PoseWithCovariance, Twist } from "./geometry";
import type { RosHeader } from "./std";

/**
 * Metadata describing an occupancy grid map.
 * Note: name kept verbose to avoid clash with UI's "MapMeta" (renamed SavedMap).
 */
export interface MapMetaData {
  map_load_time: { sec: number; nanosec: number };
  /** meters per cell */
  resolution: number;
  /** cells */
  width: number;
  /** cells */
  height: number;
  /** Real-world pose of cell (0,0) — bottom-left corner */
  origin: Pose;
}

/**
 * 2D grid map; each cell is int8:
 *   -1 = unknown
 *   0..100 = probability of being occupied (free → occupied)
 *
 * Data is row-major, starting from bottom-left in ROS convention.
 */
export interface OccupancyGrid {
  header: RosHeader;
  info: MapMetaData;
  data: number[];
}

export interface Odometry {
  header: RosHeader;
  child_frame_id: string;
  pose: PoseWithCovariance;
  twist: {
    twist: Twist;
    covariance: number[];
  };
}

export interface Path {
  header: RosHeader;
  poses: PoseStamped[];
}
