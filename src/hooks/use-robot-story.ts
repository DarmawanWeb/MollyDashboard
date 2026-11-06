"use client";

import { useMemo } from "react";
import { deriveStory, nearestPlace, type Story } from "@/lib/display/story";
import { isWalking } from "@/lib/navigation/codec";
import { useNavigationStore } from "@/stores/use-navigation-store";
import { useRobotStore } from "@/stores/use-robot-store";
import { useSiteStore } from "@/stores/use-site-store";
import { useTourStore } from "@/stores/use-tour-store";
import { useRobotActivity } from "./use-robot-activity";

/**
 * What Molly is doing, in visitor terms (lib/display/story.ts). Selectors
 * return names, not the pose, so a component re-renders when the story
 * changes, not at the pose rate; the result keeps its identity meanwhile.
 */
export function useRobotStory(): Story {
  const activity = useRobotActivity();
  const pois = useSiteStore((s) => s.pois);
  const placeName = useRobotStore(
    (s) => nearestPlace(s.pose, pois)?.name ?? "",
  );
  const tourState = useTourStore((s) => s.state);
  const tourActivity = useTourStore((s) => s.activity);
  const tourPoiName = useTourStore((s) => s.activePoiName);
  const goalName = useNavigationStore((s) =>
    isWalking(s.planner.state) && s.planner.goalId
      ? (pois.find((p) => p.id === s.planner.goalId)?.name ?? "")
      : "",
  );

  const { kind, place, target } = deriveStory({
    activity,
    tourState,
    tourActivity,
    tourPoiName,
    goalName,
    placeName,
  });
  return useMemo(() => ({ kind, place, target }), [kind, place, target]);
}
