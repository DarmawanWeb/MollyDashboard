/**
 * Public API for the ROS integration layer.
 *
 * Typical usage:
 *
 *   import { getRos, TOPICS, SERVICES } from "@/lib/ros";
 *
 *   // subscribe
 *   const unsub = getRos().subscribe(TOPICS.MAP, (grid) => {
 *     // grid is typed as OccupancyGrid
 *   });
 *
 *   // publish
 *   getRos().publish(TOPICS.CMD_VEL, makeTwist2D(0.3, 0));
 *
 *   // service call
 *   await getRos().callService(SERVICES.SAVE_MAP, { name: "lobby" });
 */

export { type ClientConfig, RosClient } from "./client";
export {
  degreesToRadians,
  downsampleGrid,
  makeTwist2D,
  poseToRobotPose,
  quaternionToEuler,
  quaternionToYaw,
  radiansToDegrees,
  rosTimeToMs,
  STOP_TWIST,
  yawToQuaternion,
} from "./codec";
export { __resetRos, configureRos, getRos } from "./singleton";
export {
  SERVICES,
  type ServiceDef,
  type ServiceKey,
  TOPICS,
  type TopicDef,
  type TopicKey,
  type TopicMsg,
} from "./topics";
export { RosTransport, type TransportConfig } from "./transport";
