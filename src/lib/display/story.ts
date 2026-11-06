/**
 * What Molly is doing, told the way a visitor would say it: one "story"
 * derived from the robot activity, the tour and where the robot is. The
 * display renders it in Indonesian or English; the LLM gateway gets the
 * English sentence as context. Pure functions only.
 */

import type {
  POI,
  RobotActivityKey,
  RobotPose,
  TourActivity,
  TourState,
} from "@/types/ui";

export type StoryKind =
  | "offline"
  | "idle"
  | "walking"
  | "guiding"
  | "narrating"
  | "visiting"
  | "waiting"
  | "gesture"
  | "paused"
  | "returning"
  | "blocked"
  | "stopped"
  | "mapping"
  | "remote";

export interface Story {
  kind: StoryKind;
  /** Named place the robot is at, empty when none */
  place: string;
  /** Where the robot is heading, empty when none */
  target: string;
}

/** Within this distance of a POI the robot counts as "at" it. */
const NEAR_M = 1.5;

/** The named place the robot stands at or next to. */
export function nearestPlace(
  pose: RobotPose | null,
  pois: ReadonlyArray<POI>,
): POI | null {
  if (!pose) return null;
  let best: POI | null = null;
  let bestDist = NEAR_M;
  for (const poi of pois) {
    const d = Math.hypot(poi.x - pose.x, poi.y - pose.y);
    if (d <= bestDist) {
      best = poi;
      bestDist = d;
    }
  }
  return best;
}

export interface StoryInputs {
  activity: RobotActivityKey;
  tourState: TourState;
  tourActivity: TourActivity;
  /** Current tour stop */
  tourPoiName: string;
  /** Name of the walk-to goal, empty when none */
  goalName: string;
  /** Nearest named place */
  placeName: string;
}

export function deriveStory(i: StoryInputs): Story {
  const place = i.placeName;
  const touring = i.tourState === "RUNNING" || i.tourState === "PAUSED";

  switch (i.activity) {
    case "OFFLINE":
      return { kind: "offline", place: "", target: "" };
    case "ESTOP":
      return { kind: "stopped", place, target: "" };
    case "BLOCKED":
      return {
        kind: "blocked",
        place,
        target: touring ? i.tourPoiName : i.goalName,
      };
    case "MAPPING":
      return { kind: "mapping", place: "", target: "" };
    case "REMOTE":
      return { kind: "remote", place, target: "" };
    default:
      break;
  }

  if (touring) {
    if (i.tourState === "PAUSED") {
      return { kind: "paused", place: place || i.tourPoiName, target: "" };
    }
    switch (i.tourActivity) {
      case "narrating":
        return { kind: "narrating", place: i.tourPoiName || place, target: "" };
      case "dwelling":
        return { kind: "visiting", place: i.tourPoiName || place, target: "" };
      case "performing_motion":
        return { kind: "gesture", place: i.tourPoiName || place, target: "" };
      case "waiting_visitors":
        return { kind: "waiting", place, target: i.tourPoiName };
      case "returning":
        return { kind: "returning", place, target: i.tourPoiName };
      default:
        return { kind: "guiding", place, target: i.tourPoiName };
    }
  }

  if (i.activity === "WALKING") {
    return { kind: "walking", place, target: i.goalName };
  }
  return { kind: "idle", place, target: "" };
}

/** The story as an English phrase, for the LLM prompt. */
export function storySentence(s: Story): string {
  const to = (target: string, fallback: string) =>
    target ? `${fallback} to ${target}` : fallback;
  switch (s.kind) {
    case "offline":
      return "offline (not connected to the dashboard)";
    case "idle":
      return s.place
        ? `standing by at ${s.place}, ready to help`
        : "standing by, ready to help";
    case "walking":
      return to(s.target, "walking");
    case "guiding":
      return s.target
        ? `guiding a tour, walking to ${s.target}`
        : "guiding a tour";
    case "narrating":
      return s.place
        ? `explaining ${s.place} to visitors`
        : "explaining a stop";
    case "visiting":
      return s.place
        ? `at ${s.place}, letting visitors look around`
        : "letting visitors look around";
    case "waiting":
      return "waiting for the visitors to catch up";
    case "gesture":
      return "performing a gesture for the visitors";
    case "paused":
      return "on a paused tour";
    case "returning":
      return to(s.target, "returning");
    case "blocked":
      return "waiting for the path to clear";
    case "stopped":
      return "holding still (emergency stop engaged)";
    case "mapping":
      return "mapping the area";
    case "remote":
      return "being driven by the staff";
  }
}
