/**
 * Point of Interest — operator-defined waypoints on a saved map.
 */

export type MotionAction = "none" | "wave" | "bow" | "sit" | "stand" | "dance";

export interface POI {
  id: string;
  name: string;
  description: string;
  /** Grid cell X (will be converted to world coords using map origin + resolution) */
  x: number;
  /** Grid cell Y */
  y: number;
  /** Position in tour sequence */
  orderIndex: number;
  /** Spoken narration when robot arrives */
  narrationText?: string | null;
  /** Optional motion gesture to perform on arrival */
  motionAction?: MotionAction | null;
  /** Seconds to remain at the POI */
  dwellTimeSec: number;
  /** FK to SavedMap */
  mapId: string;
}

export interface POIFormData {
  name: string;
  description: string;
  narrationText: string;
  motionAction: MotionAction;
  dwellTimeSec: number;
}
