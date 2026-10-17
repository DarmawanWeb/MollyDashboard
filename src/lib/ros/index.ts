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
 *   // publish (teleop goes through the control mux)
 *   getRos().publish(TOPICS.REMOTE_CMD_VEL, makeTwist(0.3, 0, 0));
 *
 *   // service call
 *   await getRos().callService(SERVICES.SITE_LOAD, { site: "lobby" });
 */

export { type ClientConfig, RosClient } from "./client";
export {
  degreesToRadians,
  downsampleGrid,
  makeTwist,
  makeTwist2D,
  poseToRobotPose,
  quaternionToEuler,
  quaternionToYaw,
  radiansToDegrees,
  rosTimeToMs,
  STOP_TWIST,
  yawToQuaternion,
} from "./codec";
export {
  DEFAULT_ROBOT_NAMESPACE,
  isValidNamespace,
  normalizeNamespace,
  ROBOT_NS_TOKEN,
  resolveName,
} from "./names";
export {
  boolParameter,
  doubleParameter,
  numberValue,
  PARAMETER_TYPE,
  setParametersError,
} from "./params";
export { __resetRos, configureRos, getRos } from "./singleton";
export {
  robotCommandService,
  SERVICES,
  type ServiceDef,
  type ServiceKey,
  TOPICS,
  type TopicDef,
  type TopicKey,
  type TopicMsg,
} from "./topics";
export { RosTransport, type TransportConfig } from "./transport";
