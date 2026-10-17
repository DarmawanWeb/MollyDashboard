/**
 * Point of interest — a place on the active site's map where tours stop.
 *
 * Lives on the robot (site/pois); the dashboard edits it through services.
 */

/** Narration language; empty string means the robot's speech default. */
export type Language = "" | "id" | "en";

export interface POI {
  id: string;
  name: string;
  description: string;
  /** m, map frame */
  x: number;
  /** m, map frame */
  y: number;
  /** rad, heading the robot takes on arrival */
  yaw: number;
  narration: string;
  language: Language;
  /** Gesture on arrival, empty for none */
  gesture: string;
  /** Wait after the narration (seconds) */
  dwellSec: number;
}

/** POI being created or edited; an empty id creates a new one. */
export type PoiDraft = POI;

/** Editable POI fields (the form). */
export interface POIFormData {
  name: string;
  description: string;
  narration: string;
  language: Language;
  gesture: string;
  dwellSec: number;
}
