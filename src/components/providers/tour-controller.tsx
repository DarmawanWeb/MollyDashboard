"use client";

import type { ReactNode } from "react";
import { useTourController } from "@/hooks/use-tour-controller";

/**
 * Mounts the tour controller exactly once at app root.
 *
 * Why a provider component rather than calling useTourController() inside
 * a page: the subscription + service call should happen once, not every
 * time a page navigates. Consumer components call useTourController()
 * again to access sendCommand etc — the hook is idempotent for repeated
 * calls (subscriptions are deduplicated by RosClient).
 */
export function TourController({ children }: { children: ReactNode }) {
  useTourController();
  return <>{children}</>;
}
