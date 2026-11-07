"use client";

import type { ReactNode } from "react";
import { useTourSync } from "@/hooks/use-tour-controller";

/**
 * Runs the tour state sync exactly once at the app root (/tour/state, or the
 * mock tour offline). Components send commands with useTourController(),
 * which shares this one tour, so it keeps running while pages change.
 */
export function TourController({ children }: { children: ReactNode }) {
  useTourSync();
  return <>{children}</>;
}
