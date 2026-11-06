"use client";

import { useEffect, useRef } from "react";
import { useRobotApi } from "@/hooks/use-robot-api";
import { useTourController } from "@/hooks/use-tour-controller";
import { useSiteStore } from "@/stores/use-site-store";
import { useTourStore } from "@/stores/use-tour-store";

/** Quiet time between demo tours. */
const IDLE_MS = 8000;

/**
 * Demo builds only (NEXT_PUBLIC_USE_MOCKS): keeps the display alive with the
 * in-memory robot — starts a tour whenever the robot has been idle for a
 * few seconds and speaks each stop's narration, so the captions, journey and
 * map move like they do with the real Molly. Never mounted for a live robot.
 */
export function DemoAutopilot() {
  const api = useRobotApi();
  const { sendCommand } = useTourController();
  const state = useTourStore((s) => s.state);
  const tours = useSiteStore((s) => s.tours);
  const pois = useSiteStore((s) => s.pois);
  const send = useRef(sendCommand);
  send.current = sendCommand;

  // start the next tour after a pause
  useEffect(() => {
    if (state !== "IDLE" || (tours.length === 0 && pois.length === 0)) return;
    const timer = setTimeout(() => {
      const tour = tours[0];
      send.current(
        tour
          ? { kind: "START", tourId: tour.id, poiIds: [] }
          : { kind: "START", tourId: "", poiIds: pois.map((p) => p.id) },
      );
    }, IDLE_MS);
    return () => clearTimeout(timer);
  }, [state, tours, pois]);

  // say each stop's narration, like the robot's guide node does
  useEffect(
    () =>
      useTourStore.subscribe((s, prev) => {
        if (s.activity !== "narrating" || prev.activity === "narrating") return;
        const poi = useSiteStore
          .getState()
          .pois.find((p) => p.id === s.activePoiId);
        if (poi?.narration) {
          void api.say(poi.narration, poi.language || "id", true);
        }
      }),
    [api],
  );

  return null;
}
