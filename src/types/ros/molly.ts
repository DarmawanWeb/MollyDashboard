/**
 * Wire formats of the molly_interfaces and dharma_interfaces packages (Molly on Dharma).
 *
 * Mirrors molly_interfaces (Molly repository) and dharma_interfaces field by
 * field. Lives in types/ros/ so lib/ros/topics.ts can import it without a
 * cycle; conversion to UI shapes happens in lib/site, lib/tour, lib/robot.
 */

import type { Point } from "./geometry";
import type { RosHeader } from "./std";

/* ----------------------------------------------------------------------------
 * Navigation
 * ------------------------------------------------------------------------- */

/** dharma_interfaces/msg/Waypoint — x, y in m (map), yaw in degrees */
export interface WaypointWire {
  x: number;
  y: number;
  yaw: number;
  dwell_sec: number;
}

/** dharma_interfaces/msg/NavigationStatus */
export interface NavigationStatusWire {
  header: RosHeader;
  state: string;
  message: string;
}

/** dharma_interfaces/msg/PlannerStatus */
export interface PlannerStatusWire {
  header: RosHeader;
  /** idle, planning, following, replanning, arrived, failed, cancelled */
  state: string;
  goal_id: string;
  goal_x: number;
  goal_y: number;
  goal_yaw: number;
  path_length: number;
  remaining: number;
  replans: number;
  message: string;
}

/* ----------------------------------------------------------------------------
 * Sites, POIs, tours, mapping
 * ------------------------------------------------------------------------- */

/** dharma_interfaces/msg/Poi — x, y in m (map frame), yaw in rad */
export interface PoiWire {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  yaw: number;
  narration: string;
  language: string;
  gesture: string;
  dwell_sec: number;
}

/** dharma_interfaces/msg/PoiArray */
export interface PoiArrayWire {
  header: RosHeader;
  site: string;
  pois: PoiWire[];
}

/** dharma_interfaces/msg/Tour */
export interface TourWire {
  id: string;
  name: string;
  description: string;
  poi_ids: string[];
  return_poi_id: string;
}

/** dharma_interfaces/msg/TourArray */
export interface TourArrayWire {
  header: RosHeader;
  site: string;
  tours: TourWire[];
}

/** dharma_interfaces/msg/SiteStatus */
export interface SiteStatusWire {
  header: RosHeader;
  site: string;
  sites: string[];
  has_map: boolean;
  mapping: boolean;
  pois: number;
  tours: number;
  tags: number;
  message: string;
}

/** dharma_interfaces/msg/MappingStatus */
export interface MappingStatusWire {
  header: RosHeader;
  active: boolean;
  site: string;
  scans: number;
  resolution: number;
  width: number;
  height: number;
  known_area_m2: number;
  message: string;
}

/* ----------------------------------------------------------------------------
 * Guide and interaction
 * ------------------------------------------------------------------------- */

/** molly_interfaces/msg/TourCommand */
export interface TourCommandWire {
  /** KIND_START=0, PAUSE=1, RESUME=2, STOP=3, SKIP=4 */
  kind: number;
  tour_id: string;
  poi_ids: string[];
}

/** molly_interfaces/msg/TourState */
export interface TourStateWire {
  header: RosHeader;
  /** STATE_IDLE=0, STARTING=1, RUNNING=2, PAUSED=3, STOPPING=4, ERROR=5 */
  state: number;
  tour_id: string;
  tour_name: string;
  current_poi_index: number;
  total_pois: number;
  current_poi_id: string;
  current_poi_name: string;
  activity: string;
  message: string;
  error_reason: string;
}

/** molly_interfaces/msg/SpeechStatus */
export interface SpeechStatusWire {
  header: RosHeader;
  id: number;
  /** idle, speaking, done, failed, cancelled */
  state: string;
  text: string;
  language: string;
  queued: number;
  engine: string;
  message: string;
}

/** dharma_interfaces/msg/Visitors — positions in base_link */
export interface VisitorsWire {
  header: RosHeader;
  positions: Point[];
  confidences: number[];
  count: number;
  front: number;
  behind: number;
  nearest: number;
  nearest_front: number;
  nearest_behind: number;
}

/* ----------------------------------------------------------------------------
 * Services
 * ------------------------------------------------------------------------- */

/** Response shape shared by most Molly services */
export interface ResultWire {
  success: boolean;
  message: string;
}

export interface ListSitesResponseWire {
  sites: string[];
  active: string;
}

export interface LoadSiteRequestWire {
  site: string;
}

export interface StartMappingRequestWire {
  site: string;
  reset: boolean;
}

export interface SavePoiRequestWire {
  poi: PoiWire;
  at_robot_pose: boolean;
}

export interface SavePoiResponseWire extends ResultWire {
  poi: PoiWire;
}

export interface SaveTourRequestWire {
  tour: TourWire;
}

export interface SaveTourResponseWire extends ResultWire {
  tour: TourWire;
}

export interface DeleteByIdRequestWire {
  id: string;
}

export interface PlanPathRequestWire {
  x: number;
  y: number;
  yaw: number;
}

export interface PlanPathResponseWire extends ResultWire {
  waypoints: WaypointWire[];
  length: number;
}

export interface GoToRequestWire {
  poi_id: string;
  x: number;
  y: number;
  yaw: number;
}

export interface TourControlRequestWire {
  command: TourCommandWire;
}

export interface GetTourStateResponseWire {
  state: TourStateWire;
}

export interface SayRequestWire {
  text: string;
  language: string;
  interrupt: boolean;
}

export interface SayResponseWire extends ResultWire {
  id: number;
}

export interface AskRequestWire {
  question: string;
  language: string;
  speak: boolean;
}

export interface AskResponseWire {
  success: boolean;
  answer: string;
  message: string;
}

export interface GestureRequestWire {
  name: string;
}

export interface SetModeRequestWire {
  mode: "auto" | "remote";
}
