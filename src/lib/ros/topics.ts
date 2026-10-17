/**
 * Topic and service registry — the single source of truth for every ROS name
 * and type the dashboard uses (Molly web contract, docs/web.md in the Molly
 * repository).
 *
 * Names under the robot driver use the `{robot}` placeholder, resolved by
 * the client with the configured robot namespace (lib/ros/names.ts).
 */

import type { DiagnosticArray } from "@/types/ros/diagnostic";
import type { PoseStamped, Twist } from "@/types/ros/geometry";
import type { Lite3RobotStateWire } from "@/types/ros/lite3";
import type {
  AskRequestWire,
  AskResponseWire,
  DeleteByIdRequestWire,
  GestureRequestWire,
  GetTourStateResponseWire,
  GoToRequestWire,
  ListSitesResponseWire,
  LoadSiteRequestWire,
  MappingStatusWire,
  NavigationStatusWire,
  PlannerStatusWire,
  PlanPathRequestWire,
  PlanPathResponseWire,
  PoiArrayWire,
  ResultWire,
  SavePoiRequestWire,
  SavePoiResponseWire,
  SaveTourRequestWire,
  SaveTourResponseWire,
  SayRequestWire,
  SayResponseWire,
  SetModeRequestWire,
  SiteStatusWire,
  SpeechStatusWire,
  StartMappingRequestWire,
  TourArrayWire,
  TourCommandWire,
  TourControlRequestWire,
  TourStateWire,
  VisitorsWire,
} from "@/types/ros/molly";
import type { OccupancyGrid, Path } from "@/types/ros/nav";
import type {
  GetParametersRequest,
  GetParametersResponse,
  RosapiNodesResponse,
  RosapiTopicsResponse,
  RosLog,
  SetParametersRequest,
  SetParametersResponse,
} from "@/types/ros/rcl";
import type { BatteryState, Imu } from "@/types/ros/sensor";
import type {
  SetBoolRequest,
  StdBool,
  StdString,
  TriggerRequest,
  TriggerResponse,
} from "@/types/ros/std";

/* ----------------------------------------------------------------------------
 * Topic definitions
 * ------------------------------------------------------------------------- */

export interface TopicDef<TMsg> {
  readonly name: string;
  readonly type: string;
  /** Phantom — never read at runtime, only used to carry TMsg into call sites */
  readonly __msg?: TMsg;
}

function topic<TMsg>(name: string, type: string): TopicDef<TMsg> {
  return { name, type };
}

const MOLLY_MSG = "molly_interfaces/msg";

export const TOPICS = {
  // Map and localization
  MAP: topic<OccupancyGrid>("/map", "nav_msgs/msg/OccupancyGrid"),
  LOCALIZATION_POSE: topic<PoseStamped>(
    "/localization/pose",
    "geometry_msgs/msg/PoseStamped",
  ),
  LOCALIZATION_STATUS: topic<StdString>(
    "/localization/status",
    "std_msgs/msg/String",
  ),
  ODOMETRY_STATUS: topic<StdString>("/odometry/status", "std_msgs/msg/String"),

  // Sites and mapping
  SITE_STATUS: topic<SiteStatusWire>("/site/status", `${MOLLY_MSG}/SiteStatus`),
  SITE_POIS: topic<PoiArrayWire>("/site/pois", `${MOLLY_MSG}/PoiArray`),
  SITE_TOURS: topic<TourArrayWire>("/site/tours", `${MOLLY_MSG}/TourArray`),
  MAPPING_STATUS: topic<MappingStatusWire>(
    "/mapping/status",
    `${MOLLY_MSG}/MappingStatus`,
  ),

  // Path finder and follower
  PLANNER_STATUS: topic<PlannerStatusWire>(
    "/planner/status",
    `${MOLLY_MSG}/PlannerStatus`,
  ),
  PLANNER_PATH: topic<Path>("/planner/path", "nav_msgs/msg/Path"),
  NAVIGATION_STATUS: topic<NavigationStatusWire>(
    "/navigation/status",
    `${MOLLY_MSG}/NavigationStatus`,
  ),

  // Tour (robot-side authority)
  TOUR_STATE: topic<TourStateWire>("/tour/state", `${MOLLY_MSG}/TourState`),
  TOUR_CMD: topic<TourCommandWire>("/tour/cmd", `${MOLLY_MSG}/TourCommand`),

  // Interaction
  SPEECH_STATUS: topic<SpeechStatusWire>(
    "/interaction/speech_status",
    `${MOLLY_MSG}/SpeechStatus`,
  ),
  SAY_TEXT: topic<StdString>("/interaction/say_text", "std_msgs/msg/String"),
  GREETER: topic<StdString>("/interaction/greeter", "std_msgs/msg/String"),
  CONVERSATION: topic<StdString>(
    "/interaction/conversation",
    "std_msgs/msg/String",
  ),
  VISITORS: topic<VisitorsWire>(
    "/perception/visitors",
    `${MOLLY_MSG}/Visitors`,
  ),

  // Control mux
  BRIDGE_MODE: topic<StdString>("/bridge/mode", "std_msgs/msg/String"),
  ESTOP_ENGAGED: topic<StdBool>("/bridge/estop_engaged", "std_msgs/msg/Bool"),
  ESTOP_REASON: topic<StdString>("/bridge/estop_reason", "std_msgs/msg/String"),
  PROTECTIVE_FIELD: topic<StdString>(
    "/bridge/protective_field",
    "std_msgs/msg/String",
  ),
  REMOTE_CMD_VEL: topic<Twist>(
    "/bridge/remote_cmd_vel",
    "geometry_msgs/msg/Twist",
  ),

  // System
  HEALTH: topic<StdString>("/health/status", "std_msgs/msg/String"),
  ROSOUT: topic<RosLog>("/rosout", "rcl_interfaces/msg/Log"),

  // Robot driver (namespaced)
  BATTERY: topic<BatteryState>(
    "/{robot}/battery",
    "sensor_msgs/msg/BatteryState",
  ),
  IMU: topic<Imu>("/{robot}/imu", "sensor_msgs/msg/Imu"),
  ROBOT_STATE: topic<Lite3RobotStateWire>(
    "/{robot}/state",
    "lite3_interfaces/msg/RobotState",
  ),
  ROBOT_DIAGNOSTICS: topic<DiagnosticArray>(
    "/{robot}/diagnostics",
    "diagnostic_msgs/msg/DiagnosticArray",
  ),
} as const;

export type TopicKey = keyof typeof TOPICS;

/** Extract the message type for a given topic key. */
export type TopicMsg<K extends TopicKey> = (typeof TOPICS)[K] extends TopicDef<
  infer M
>
  ? M
  : never;

/* ----------------------------------------------------------------------------
 * Service definitions
 * ------------------------------------------------------------------------- */

export interface ServiceDef<TReq, TRes> {
  readonly name: string;
  readonly type: string;
  readonly __req?: TReq;
  readonly __res?: TRes;
}

function service<TReq, TRes>(
  name: string,
  type: string,
): ServiceDef<TReq, TRes> {
  return { name, type };
}

const MOLLY_SRV = "molly_interfaces/srv";
const TRIGGER = "std_srvs/srv/Trigger";
const SET_BOOL = "std_srvs/srv/SetBool";

function trigger(name: string): ServiceDef<TriggerRequest, TriggerResponse> {
  return service(name, TRIGGER);
}

export const SERVICES = {
  // Sites and mapping
  SITE_LIST: service<Record<string, never>, ListSitesResponseWire>(
    "/site/list",
    `${MOLLY_SRV}/ListSites`,
  ),
  SITE_LOAD: service<LoadSiteRequestWire, ResultWire>(
    "/site/load",
    `${MOLLY_SRV}/LoadSite`,
  ),
  MAPPING_START: service<StartMappingRequestWire, ResultWire>(
    "/mapping/start",
    `${MOLLY_SRV}/StartMapping`,
  ),
  MAPPING_STOP: trigger("/mapping/stop"),
  MAPPING_SAVE: trigger("/mapping/save"),
  LOCALIZATION_START: trigger("/localization/start"),
  LOCALIZATION_RECORD_TAGS: trigger("/localization/record_tags"),

  // POIs and tours
  SAVE_POI: service<SavePoiRequestWire, SavePoiResponseWire>(
    "/site/save_poi",
    `${MOLLY_SRV}/SavePoi`,
  ),
  DELETE_POI: service<DeleteByIdRequestWire, ResultWire>(
    "/site/delete_poi",
    `${MOLLY_SRV}/DeleteById`,
  ),
  SAVE_TOUR: service<SaveTourRequestWire, SaveTourResponseWire>(
    "/site/save_tour",
    `${MOLLY_SRV}/SaveTour`,
  ),
  DELETE_TOUR: service<DeleteByIdRequestWire, ResultWire>(
    "/site/delete_tour",
    `${MOLLY_SRV}/DeleteById`,
  ),

  // Path finder and follower
  PLANNER_PLAN: service<PlanPathRequestWire, PlanPathResponseWire>(
    "/planner/plan",
    `${MOLLY_SRV}/PlanPath`,
  ),
  PLANNER_GO_TO: service<GoToRequestWire, ResultWire>(
    "/planner/go_to",
    `${MOLLY_SRV}/GoTo`,
  ),
  PLANNER_CANCEL: trigger("/planner/cancel"),
  NAVIGATION_PAUSE: service<SetBoolRequest, TriggerResponse>(
    "/navigation/pause",
    SET_BOOL,
  ),
  FOLLOWER_GET_PARAMS: service<GetParametersRequest, GetParametersResponse>(
    "/path_follower_node/get_parameters",
    "rcl_interfaces/srv/GetParameters",
  ),
  FOLLOWER_SET_PARAMS: service<SetParametersRequest, SetParametersResponse>(
    "/path_follower_node/set_parameters",
    "rcl_interfaces/srv/SetParameters",
  ),

  // Tour
  TOUR_CONTROL: service<TourControlRequestWire, ResultWire>(
    "/tour/control",
    `${MOLLY_SRV}/TourControl`,
  ),
  /**
   * Snapshot of current tour state. Called by useTourController on (re)connect
   * to bootstrap UI before topic subscription delivers the first event.
   */
  TOUR_GET_STATE: service<Record<string, never>, GetTourStateResponseWire>(
    "/tour/get_state",
    `${MOLLY_SRV}/GetTourState`,
  ),

  // Interaction
  SAY: service<SayRequestWire, SayResponseWire>(
    "/interaction/say",
    `${MOLLY_SRV}/Say`,
  ),
  STOP_SPEECH: trigger("/interaction/stop_speech"),
  GESTURE: service<GestureRequestWire, ResultWire>(
    "/interaction/gesture",
    `${MOLLY_SRV}/Gesture`,
  ),
  GREET: trigger("/interaction/greet"),
  SET_GREETER: service<SetBoolRequest, TriggerResponse>(
    "/interaction/set_greeter",
    SET_BOOL,
  ),
  ASK: service<AskRequestWire, AskResponseWire>(
    "/interaction/ask",
    `${MOLLY_SRV}/Ask`,
  ),

  // Control mux
  SET_MODE: service<SetModeRequestWire, ResultWire>(
    "/bridge/set_mode",
    `${MOLLY_SRV}/SetMode`,
  ),
  ESTOP: service<SetBoolRequest, TriggerResponse>("/bridge/estop", SET_BOOL),

  // System (rosapi, started with rosbridge)
  ROSAPI_TOPICS: service<Record<string, never>, RosapiTopicsResponse>(
    "/rosapi/topics",
    "rosapi/srv/Topics",
  ),
  ROSAPI_NODES: service<Record<string, never>, RosapiNodesResponse>(
    "/rosapi/nodes",
    "rosapi/srv/Nodes",
  ),
} as const;

export type ServiceKey = keyof typeof SERVICES;

/**
 * A robot driver command (`std_srvs/Trigger` under the robot namespace),
 * e.g. robotCommandService("stand_up") → /{robot}/stand_up.
 */
export function robotCommandService(
  command: string,
): ServiceDef<TriggerRequest, TriggerResponse> {
  return trigger(`/{robot}/${command}`);
}
