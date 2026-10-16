"use client";

import { AppSection } from "@/components/layout/app/section";

/**
 * Placeholder until a persisted map registry is built.
 *
 * Implementation requires either:
 *   - Re-introducing Prisma + Postgres for server-side persistence
 *   - Storing map metadata in localStorage (zustand persist, simple, but no
 *     sharing between operators)
 *   - Server-side ROS service that lists maps under the robot's map_server
 *     directory (most native — robot already knows its own maps)
 *
 * The third option is cleanest for the deployment model where robot is the
 * source of truth. Defer until robot-side has a `/maps/list` service.
 */
export function SavedMaps() {
  return (
    <AppSection title="Saved Maps">
      <div className="text-xs text-txt-muted text-center py-4">
        No saved maps — save after SLAM
      </div>
    </AppSection>
  );
}
