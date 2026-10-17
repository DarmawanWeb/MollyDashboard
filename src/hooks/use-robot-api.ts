"use client";

import { createLiveApi } from "@/lib/robot/live-api";
import { getMockRobot } from "@/mocks/mock-robot";
import type { RobotApi } from "@/types/ui";
import { useMockMode } from "./use-mock-mode";

let liveApi: RobotApi | null = null;

/** The live (rosbridge) or the mock robot API, without React. */
export function getRobotApi(mock: boolean): RobotApi {
  if (mock) return getMockRobot().api;
  if (!liveApi) liveApi = createLiveApi();
  return liveApi;
}

/**
 * The robot API for the current mode. Components call actions on it without
 * knowing whether a real robot or the offline mock answers.
 */
export function useRobotApi(): RobotApi {
  return getRobotApi(useMockMode());
}
