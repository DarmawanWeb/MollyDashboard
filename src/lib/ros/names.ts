/**
 * ROS name resolution for the topic/service registry.
 *
 * The robot driver lives under a configurable namespace (`/robot` by
 * default). Registry entries use the `{robot}` placeholder, e.g.
 * `/{robot}/battery`, and the client resolves it at call time.
 */

export const ROBOT_NS_TOKEN = "{robot}";

export const DEFAULT_ROBOT_NAMESPACE = "robot";

/** Strip slashes around a namespace: "/robot/" → "robot". */
export function normalizeNamespace(ns: string): string {
  return ns.trim().replace(/^\/+|\/+$/g, "");
}

/** True for a valid ROS namespace without leading/trailing slashes. */
export function isValidNamespace(ns: string): boolean {
  return /^[A-Za-z][A-Za-z0-9_]*(\/[A-Za-z][A-Za-z0-9_]*)*$/.test(
    normalizeNamespace(ns),
  );
}

/** Replace the robot placeholder: ("/{robot}/odom", "robot") → "/robot/odom". */
export function resolveName(name: string, robotNamespace: string): string {
  if (!name.includes(ROBOT_NS_TOKEN)) return name;
  const ns = normalizeNamespace(robotNamespace) || DEFAULT_ROBOT_NAMESPACE;
  return name.replace(ROBOT_NS_TOKEN, ns);
}
