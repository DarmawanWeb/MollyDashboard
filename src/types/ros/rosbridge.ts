/**
 * rosbridge_suite WebSocket protocol message shapes.
 * @see https://github.com/RobotWebTools/rosbridge_suite/blob/ros2/ROSBRIDGE_PROTOCOL.md
 */

export type RosbridgeOp =
  | "subscribe"
  | "unsubscribe"
  | "publish"
  | "advertise"
  | "unadvertise"
  | "call_service"
  | "service_response"
  | "advertise_service"
  | "unadvertise_service"
  | "service_request"
  | "auth"
  | "status";

interface BaseMsg {
  op: RosbridgeOp;
  id?: string;
}

export interface SubscribeMsg extends BaseMsg {
  op: "subscribe";
  topic: string;
  type: string;
  throttle_rate?: number;
  queue_length?: number;
  fragment_size?: number;
  compression?: "none" | "png" | "cbor";
}

export interface UnsubscribeMsg extends BaseMsg {
  op: "unsubscribe";
  topic: string;
}

export interface PublishMsg<T = unknown> extends BaseMsg {
  op: "publish";
  topic: string;
  type?: string;
  msg: T;
  latch?: boolean;
}

export interface AdvertiseMsg extends BaseMsg {
  op: "advertise";
  topic: string;
  type: string;
  latch?: boolean;
  queue_size?: number;
}

export interface UnadvertiseMsg extends BaseMsg {
  op: "unadvertise";
  topic: string;
}

export interface CallServiceMsg<T = unknown> extends BaseMsg {
  op: "call_service";
  service: string;
  type?: string;
  args: T;
  fragment_size?: number;
}

export interface ServiceResponseMsg<T = unknown> extends BaseMsg {
  op: "service_response";
  service: string;
  values?: T;
  result: boolean;
}

export interface StatusMsg extends BaseMsg {
  op: "status";
  level: "info" | "warning" | "error" | "none";
  msg: string;
}

export type RosbridgeIncoming<T = unknown> =
  | PublishMsg<T>
  | ServiceResponseMsg<T>
  | StatusMsg;
