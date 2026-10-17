/**
 * ROS 2 diagnostic_msgs/* message shapes.
 */

import type { RosHeader } from "./std";

export interface KeyValue {
  key: string;
  value: string;
}

/** diagnostic_msgs/msg/DiagnosticStatus — level: 0 OK, 1 WARN, 2 ERROR, 3 STALE */
export interface DiagnosticStatus {
  level: number;
  name: string;
  message: string;
  hardware_id: string;
  values: KeyValue[];
}

/** diagnostic_msgs/msg/DiagnosticArray */
export interface DiagnosticArray {
  header: RosHeader;
  status: DiagnosticStatus[];
}
