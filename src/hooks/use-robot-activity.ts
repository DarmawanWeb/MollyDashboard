"use client";

import { deriveActivity } from "@/lib/robot/activity";
import { useNavigationStore } from "@/stores/use-navigation-store";
import { useRobotStore } from "@/stores/use-robot-store";
import { useSiteStore } from "@/stores/use-site-store";
import { useTourStore } from "@/stores/use-tour-store";
import type { RobotActivityKey } from "@/types";
import { useMockMode } from "./use-mock-mode";

/** What the robot is doing right now, for status badges. */
export function useRobotActivity(): RobotActivityKey {
  const mock = useMockMode();
  const connected = useRobotStore((s) => s.connectionStatus === "connected");
  const estopEngaged = useRobotStore((s) => s.control.estopEngaged);
  const mode = useRobotStore((s) => s.control.mode);
  const mappingActive = useSiteStore((s) => s.mapping.active);
  const tourState = useTourStore((s) => s.state);
  const tourActivity = useTourStore((s) => s.activity);
  const plannerState = useNavigationStore((s) => s.planner.state);
  const navigationState = useNavigationStore((s) => s.navigation.state);

  return deriveActivity({
    connected: connected || mock,
    estopEngaged,
    mode,
    mappingActive,
    tourState,
    tourActivity,
    plannerState,
    navigationState,
  });
}
