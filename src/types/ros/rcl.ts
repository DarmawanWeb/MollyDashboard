/**
 * ROS 2 rcl_interfaces/* and rosapi/* shapes used by the dashboard.
 */

/** rcl_interfaces/msg/Log — level: 10 DEBUG, 20 INFO, 30 WARN, 40 ERROR, 50 FATAL */
export interface RosLog {
  stamp: { sec: number; nanosec: number };
  level: number;
  name: string;
  msg: string;
  file: string;
  function: string;
  line: number;
}

/** rcl_interfaces/msg/ParameterValue (scalar members; type 1 bool, 2 int, 3 double, 4 string) */
export interface ParameterValue {
  type: number;
  bool_value?: boolean;
  integer_value?: number;
  double_value?: number;
  string_value?: string;
}

/** rcl_interfaces/msg/Parameter */
export interface Parameter {
  name: string;
  value: ParameterValue;
}

export interface SetParametersRequest {
  parameters: Parameter[];
}

export interface SetParametersResponse {
  results: { successful: boolean; reason: string }[];
}

export interface GetParametersRequest {
  names: string[];
}

export interface GetParametersResponse {
  values: ParameterValue[];
}

/** rosapi/srv/Topics response */
export interface RosapiTopicsResponse {
  topics: string[];
  types: string[];
}

/** rosapi/srv/Nodes response */
export interface RosapiNodesResponse {
  nodes: string[];
}
