/**
 * Wire formats for molly_msgs custom ROS interfaces.
 *
 * Lives in types/ros/ (not lib/tour/) so that lib/ros/topics.ts can import
 * these without creating a cycle through lib/tour/messages.ts.
 *
 * Conversion to/from TS-friendly tagged unions happens in lib/tour/messages.ts.
 */

import type { RosHeader } from "./std";

/** molly_msgs/msg/TourState */
export interface TourStateWire {
  header: RosHeader;
  /** STATE_IDLE=0, STARTING=1, RUNNING=2, PAUSED=3, STOPPING=4, ERROR=5 */
  state: number;
  current_poi_index: number;
  total_pois: number;
  current_poi_id: string;
  activity: string;
  error_reason: string;
}

/** molly_msgs/msg/TourCommand */
export interface TourCommandWire {
  /** KIND_START=0, PAUSE=1, RESUME=2, STOP=3, SKIP=4 */
  kind: number;
  poi_ids: string[];
}

/** molly_msgs/srv/GetTourState response */
export interface GetTourStateResponseWire {
  state: TourStateWire;
}
