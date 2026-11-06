"use client";

import { deriveStory, nearestPlace, type Story } from "@/lib/display/story";
import { isWalking } from "@/lib/navigation/codec";
import { useNavigationStore } from "@/stores/use-navigation-store";
import { useRobotStore } from "@/stores/use-robot-store";
import { useSiteStore } from "@/stores/use-site-store";
import { useTourStore } from "@/stores/use-tour-store";
import { useRobotActivity } from "./use-robot-activity";

/** What Molly is doing, in visitor terms (lib/display/story.ts). */
export function useRobotStory(): Story {
  const activity = useRobotActivity();
  const pose = useRobotStore((s) => s.pose);
  const pois = useSiteStore((s) => s.pois);
  const tourState = useTourStore((s) => s.state);
  const tourActivity = useTourStore((s) => s.activity);
  const tourPoiName = useTourStore((s) => s.activePoiName);
  const planner = useNavigationStore((s) => s.planner);

  const goalName =
    isWalking(planner.state) && planner.goalId
      ? (pois.find((p) => p.id === planner.goalId)?.name ?? "")
      : "";

  return deriveStory({
    activity,
    tourState,
    tourActivity,
    tourPoiName,
    goalName,
    placeName: nearestPlace(pose, pois)?.name ?? "",
  });
}
