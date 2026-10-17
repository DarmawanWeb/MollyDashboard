"use client";

import { useEffect } from "react";
import {
  decodeSpeechStatus,
  decodeVisitors,
  parseConversation,
  parseGreeter,
} from "@/lib/interaction/codec";
import {
  decodeNavigationStatus,
  decodePath,
  decodePlannerStatus,
} from "@/lib/navigation/codec";
import {
  decodeBattery,
  decodeImu,
  decodeLite3,
  parseField,
  parseLocalization,
  parseMode,
} from "@/lib/robot/codec";
import { getRos, poseToRobotPose, type RosClient, TOPICS } from "@/lib/ros";
import {
  decodeMappingStatus,
  decodePoi,
  decodeSiteStatus,
  decodeTour,
} from "@/lib/site/codec";
import { parseHealth } from "@/lib/system/health";
import { logFromRosout } from "@/lib/system/logs";
import { useInteractionStore } from "@/stores/use-interaction-store";
import { useNavigationStore } from "@/stores/use-navigation-store";
import { useRobotStore } from "@/stores/use-robot-store";
import { useSiteStore } from "@/stores/use-site-store";
import { useSystemStore } from "@/stores/use-system-store";
import type { LogEntry } from "@/types/ui";

type Unsubscribe = () => void;

/* ----------------------------------------------------------------------------
 * One setup per domain: subscribe, decode at the boundary, write the store.
 * Store setters are read with getState() so nothing here re-renders.
 * ------------------------------------------------------------------------- */

function syncTelemetry(ros: RosClient): Unsubscribe[] {
  const robot = useRobotStore.getState();
  return [
    ros.subscribe(
      TOPICS.LOCALIZATION_POSE,
      (msg) => robot.setPose(poseToRobotPose(msg.pose)),
      { throttleMs: 100 },
    ),
    ros.subscribe(TOPICS.LOCALIZATION_STATUS, (msg) => {
      const localization = parseLocalization(msg.data);
      robot.setLocalization(localization);
      if (!localization.localized) robot.setPose(null);
    }),
    ros.subscribe(TOPICS.ODOMETRY_STATUS, (msg) => robot.setOdometry(msg.data)),
    ros.subscribe(
      TOPICS.BATTERY,
      (msg) => robot.setBattery(decodeBattery(msg)),
      { throttleMs: 1000 },
    ),
    ros.subscribe(TOPICS.IMU, (msg) => robot.setImu(decodeImu(msg)), {
      throttleMs: 200,
    }),
    ros.subscribe(
      TOPICS.ROBOT_STATE,
      (msg) => robot.setLite3(decodeLite3(msg)),
      { throttleMs: 500 },
    ),
    ros.subscribe(TOPICS.BRIDGE_MODE, (msg) =>
      robot.setControl({ mode: parseMode(msg.data) }),
    ),
    ros.subscribe(TOPICS.ESTOP_ENGAGED, (msg) =>
      robot.setControl({ estopEngaged: msg.data }),
    ),
    ros.subscribe(TOPICS.ESTOP_REASON, (msg) =>
      robot.setControl({ estopReason: msg.data }),
    ),
    ros.subscribe(TOPICS.PROTECTIVE_FIELD, (msg) =>
      robot.setControl({ field: parseField(msg.data) }),
    ),
  ];
}

function syncSite(ros: RosClient): Unsubscribe[] {
  const site = useSiteStore.getState();
  return [
    ros.subscribe(TOPICS.SITE_STATUS, (msg) =>
      site.setStatus(decodeSiteStatus(msg)),
    ),
    ros.subscribe(TOPICS.SITE_POIS, (msg) =>
      site.setPois(msg.pois.map(decodePoi)),
    ),
    ros.subscribe(TOPICS.SITE_TOURS, (msg) =>
      site.setTours(msg.tours.map(decodeTour)),
    ),
    ros.subscribe(
      TOPICS.MAPPING_STATUS,
      (msg) => site.setMapping(decodeMappingStatus(msg)),
      { throttleMs: 500 },
    ),
  ];
}

function syncNavigation(ros: RosClient): Unsubscribe[] {
  const nav = useNavigationStore.getState();
  return [
    ros.subscribe(
      TOPICS.PLANNER_STATUS,
      (msg) => nav.setPlanner(decodePlannerStatus(msg)),
      { throttleMs: 250 },
    ),
    ros.subscribe(TOPICS.PLANNER_PATH, (msg) => nav.setPath(decodePath(msg))),
    ros.subscribe(
      TOPICS.NAVIGATION_STATUS,
      (msg) => nav.setNavigation(decodeNavigationStatus(msg)),
      { throttleMs: 250 },
    ),
  ];
}

/** A question the dashboard asked comes back on the topic too: skip it. */
const DUPLICATE_WINDOW_MS = 120_000;

function syncInteraction(ros: RosClient): Unsubscribe[] {
  const interaction = useInteractionStore.getState();
  return [
    ros.subscribe(TOPICS.SPEECH_STATUS, (msg) =>
      interaction.setSpeech(decodeSpeechStatus(msg)),
    ),
    ros.subscribe(TOPICS.GREETER, (msg) => {
      const greeter = parseGreeter(msg.data);
      if (greeter) interaction.setGreeter(greeter);
    }),
    ros.subscribe(TOPICS.CONVERSATION, (msg) => {
      const now = Date.now();
      const entry = parseConversation(msg.data, now);
      if (!entry) return;
      const known = useInteractionStore
        .getState()
        .conversation.some(
          (e) =>
            e.question === entry.question && now - e.at < DUPLICATE_WINDOW_MS,
        );
      if (!known) interaction.addConversation(entry);
    }),
    ros.subscribe(
      TOPICS.VISITORS,
      (msg) => interaction.setVisitors(decodeVisitors(msg)),
      { throttleMs: 500 },
    ),
  ];
}

/** /rosout can burst; hand the store one batch per flush. */
const LOG_FLUSH_MS = 250;

function syncSystem(ros: RosClient): Unsubscribe[] {
  const system = useSystemStore.getState();
  let pending: LogEntry[] = [];
  let nextId = useSystemStore.getState().logs.length;
  const flush = setInterval(() => {
    if (pending.length === 0) return;
    system.appendLogs(pending);
    pending = [];
  }, LOG_FLUSH_MS);

  return [
    ros.subscribe(
      TOPICS.HEALTH,
      (msg) => {
        const health = parseHealth(msg.data);
        if (health) system.setHealth(health);
      },
      { throttleMs: 1000 },
    ),
    ros.subscribe(
      TOPICS.ROSOUT,
      (msg) => {
        pending.push(logFromRosout(msg, nextId++));
      },
      { throttleMs: 0 },
    ),
    () => clearInterval(flush),
  ];
}

const DOMAINS = [
  syncTelemetry,
  syncSite,
  syncNavigation,
  syncInteraction,
  syncSystem,
];

/**
 * Pipe every robot topic of the web contract into the domain stores while
 * the dashboard talks to a real robot. Re-subscribes on a rebuilt client.
 */
export function useRosSync(enabled: boolean): void {
  const epoch = useRobotStore((s) => s.rosEpoch);

  useEffect(() => {
    if (!enabled) return;
    void epoch; // re-subscribe on a rebuilt client
    const ros = getRos();
    const unsubscribes = DOMAINS.flatMap((setup) => setup(ros));
    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe();
    };
  }, [enabled, epoch]);
}
