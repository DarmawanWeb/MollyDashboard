"use client";

import { useEffect } from "react";
import { getMockRobot, type MockRobotState } from "@/mocks/mock-robot";
import { useInteractionStore } from "@/stores/use-interaction-store";
import { useNavigationStore } from "@/stores/use-navigation-store";
import { useRobotStore } from "@/stores/use-robot-store";
import { useSiteStore } from "@/stores/use-site-store";
import { useSystemStore } from "@/stores/use-system-store";
import { useTourStore } from "@/stores/use-tour-store";
import type { LogEntry, LogLevel } from "@/types/ui";

const TICK_MS = 100;
const LOG_EVERY_MS = 1500;

const MOCK_LOGS: ReadonlyArray<[LogLevel, string, string]> = [
  ["info", "/site_manager_node", "site demo-hall loaded: map, 4 POIs, 1 tour"],
  ["info", "/localization_node", "localized from tag_0"],
  ["info", "/planner_node", "planned 7.4 m to hall-a in 38 ms"],
  ["info", "/path_follower_node", "FOLLOWING"],
  ["debug", "/visitor_tracker_node", "3 visitors, 2 behind"],
  ["info", "/speech_node", "speaking: Selamat datang di lobi utama."],
  ["warn", "/path_follower_node", "BLOCKED for 3.1 s, replanning"],
  ["info", "/guide_node", "tour highlights: stop 2/4 hall-a"],
];

function copyToStores(s: MockRobotState): void {
  const robot = useRobotStore.getState();
  robot.setPose(s.pose);
  robot.setLocalization(s.localization);
  robot.setOdometry(s.odometry);
  robot.setBattery(s.battery);
  robot.setImu(s.imu);
  robot.setLite3(s.lite3);
  robot.setControl(s.control);

  const site = useSiteStore.getState();
  site.setStatus(s.site);
  site.setMapping(s.mapping);
  if (site.pois !== s.pois) site.setPois(s.pois);
  if (site.tours !== s.tours) site.setTours(s.tours);

  const nav = useNavigationStore.getState();
  nav.setPlanner(s.planner);
  if (nav.path !== s.path) nav.setPath(s.path);
  nav.setNavigation(s.navigation);

  const interaction = useInteractionStore.getState();
  interaction.setSpeech(s.speech);
  interaction.setGreeter(s.greeter);
  interaction.setVisitors(s.visitors);

  useSystemStore.getState().setHealth(s.health);
}

/** The POI a running mock tour walks to, for the mock robot's motion. */
function tourTarget(): string | null {
  const tour = useTourStore.getState();
  if (tour.state !== "RUNNING") return null;
  return tour.activity === "navigating" || tour.activity === "returning"
    ? tour.activePoiId
    : null;
}

/**
 * Run the in-memory robot while offline: mirror its state into the stores,
 * step it at 10 Hz and feed the log viewer. On the way back to a real robot
 * every store is cleared so no mock value lingers.
 */
export function useMockSync(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const robot = getMockRobot();
    const unsubscribe = robot.subscribe(copyToStores);

    const tick = setInterval(
      () => robot.tick(TICK_MS / 1000, tourTarget()),
      TICK_MS,
    );

    let n = 0;
    const logs = setInterval(() => {
      const [level, node, message] = MOCK_LOGS[n % MOCK_LOGS.length];
      const entry: LogEntry = {
        id: Date.now() + n,
        timestamp: new Date().toLocaleTimeString("en-GB", { hour12: false }),
        level,
        node,
        message,
      };
      n += 1;
      useSystemStore.getState().appendLogs([entry]);
    }, LOG_EVERY_MS);

    return () => {
      unsubscribe();
      clearInterval(tick);
      clearInterval(logs);
      useRobotStore.getState().resetTelemetry();
      useSiteStore.getState().reset();
      useNavigationStore.getState().reset();
      useInteractionStore.getState().reset();
      useSystemStore.getState().reset();
    };
  }, [enabled]);
}
