/**
 * Pure conversion helpers between ROS wire formats and UI-friendly shapes.
 *
 * Keep this module free of side effects and DOM access so it's trivially
 * testable in isolation.
 */

import type { Quaternion, Twist, Vector3 } from "@/types/ros/geometry";
import type { OccupancyGrid } from "@/types/ros/nav";
import type { RobotPose } from "@/types/ui/robot";

/* ----------------------------------------------------------------------------
 * Quaternion ↔ Euler
 * ------------------------------------------------------------------------- */

/**
 * Convert a quaternion to yaw (rotation around Z axis) in radians.
 * Suitable for 2D ground-plane navigation where roll/pitch are negligible.
 */
export function quaternionToYaw(q: Quaternion): number {
  const siny_cosp = 2 * (q.w * q.z + q.x * q.y);
  const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
  return Math.atan2(siny_cosp, cosy_cosp);
}

/**
 * Build a quaternion from a yaw angle (radians), assuming zero roll/pitch.
 */
export function yawToQuaternion(yaw: number): Quaternion {
  const half = yaw / 2;
  return {
    x: 0,
    y: 0,
    z: Math.sin(half),
    w: Math.cos(half),
  };
}

/**
 * Full quaternion → Euler (roll, pitch, yaw) in radians.
 * Useful for IMU readouts.
 */
export function quaternionToEuler(q: Quaternion): {
  roll: number;
  pitch: number;
  yaw: number;
} {
  // roll (x-axis rotation)
  const sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
  const cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
  const roll = Math.atan2(sinr_cosp, cosr_cosp);

  // pitch (y-axis rotation)
  const sinp = 2 * (q.w * q.y - q.z * q.x);
  const pitch =
    Math.abs(sinp) >= 1
      ? Math.sign(sinp) * (Math.PI / 2) // gimbal lock
      : Math.asin(sinp);

  // yaw (z-axis rotation)
  const siny_cosp = 2 * (q.w * q.z + q.x * q.y);
  const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
  const yaw = Math.atan2(siny_cosp, cosy_cosp);

  return { roll, pitch, yaw };
}

export function radiansToDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function degreesToRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/* ----------------------------------------------------------------------------
 * Twist factory
 * ------------------------------------------------------------------------- */

const ZERO_VEC: Vector3 = { x: 0, y: 0, z: 0 };

/**
 * Construct a Twist message for 2D differential drive.
 */
export function makeTwist2D(linearX: number, angularZ: number): Twist {
  return {
    linear: { ...ZERO_VEC, x: linearX },
    angular: { ...ZERO_VEC, z: angularZ },
  };
}

export const STOP_TWIST: Readonly<Twist> = Object.freeze({
  linear: { ...ZERO_VEC },
  angular: { ...ZERO_VEC },
});

/* ----------------------------------------------------------------------------
 * Pose extraction
 * ------------------------------------------------------------------------- */

/**
 * Project a 3D ROS pose down to a 2D ground-plane RobotPose.
 */
export function poseToRobotPose(pose: {
  position: { x: number; y: number };
  orientation: Quaternion;
}): RobotPose {
  return {
    x: pose.position.x,
    y: pose.position.y,
    yaw: quaternionToYaw(pose.orientation),
  };
}

/* ----------------------------------------------------------------------------
 * OccupancyGrid utilities
 * ------------------------------------------------------------------------- */

/**
 * Downsample an OccupancyGrid by an integer factor.
 *
 * For large maps (>500x500), the canvas baking in `bakeGrid` becomes a
 * bottleneck. Downsampling at the source reduces memory and speeds up
 * texture upload. Uses simple block-max for occupancy preservation —
 * any occupied cell in the block marks the output cell occupied.
 *
 * Returns the original grid if `factor` <= 1.
 */
export function downsampleGrid(
  grid: OccupancyGrid,
  factor: number,
): OccupancyGrid {
  if (factor <= 1) return grid;
  const f = Math.floor(factor);
  const { width: W, height: H, resolution } = grid.info;
  const newW = Math.floor(W / f);
  const newH = Math.floor(H / f);
  const out = new Array<number>(newW * newH);

  for (let y = 0; y < newH; y++) {
    for (let x = 0; x < newW; x++) {
      let maxVal = -1;
      let sawKnown = false;
      for (let dy = 0; dy < f; dy++) {
        for (let dx = 0; dx < f; dx++) {
          const v = grid.data[(y * f + dy) * W + (x * f + dx)];
          if (v >= 0) {
            sawKnown = true;
            if (v > maxVal) maxVal = v;
          }
        }
      }
      out[y * newW + x] = sawKnown ? maxVal : -1;
    }
  }

  return {
    ...grid,
    info: {
      ...grid.info,
      width: newW,
      height: newH,
      resolution: resolution * f,
    },
    data: out,
  };
}

/* ----------------------------------------------------------------------------
 * Time helpers
 * ------------------------------------------------------------------------- */

export function rosTimeToMs(t: { sec: number; nanosec: number }): number {
  return t.sec * 1000 + t.nanosec / 1e6;
}

/**
 * Extract the 2D ground-plane origin from a ROS OccupancyGrid.
 *
 * The ROS spec stores origin as a full Pose with quaternion orientation,
 * but for 2D rendering we only need the (x, y) translation. This helper
 * collapses that so canvas code can stay flat.
 */
export function gridOrigin2D(grid: OccupancyGrid): { x: number; y: number } {
  return {
    x: grid.info.origin.position.x,
    y: grid.info.origin.position.y,
  };
}
