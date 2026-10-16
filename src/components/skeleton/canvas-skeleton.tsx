"use client";

import { Map as MapIcon } from "lucide-react";

/**
 * Placeholder for the OccupancyCanvas while the /map topic hasn't arrived.
 *
 * Renders a faint dot grid + centered icon to suggest the shape of what's
 * coming. Distinct from the canvas's own empty-state ("WAITING FOR MAP")
 * because:
 *   - This is for the *react component* not yet mounted (e.g. initial SSR)
 *   - That one is for the canvas already mounted but with no grid data
 *
 * In practice this rarely shows for more than a frame — the empty-state
 * inside the canvas is what users see most.
 */
export function CanvasSkeleton({ label = "Loading map…" }: { label?: string }) {
  return (
    <div
      aria-busy
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-mol-root"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03] bg-repeat"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="flex flex-col items-center gap-2 text-txt-muted">
        <MapIcon size={24} className="motion-safe:animate-pulse" />
        <span className="label">{label}</span>
      </div>
    </div>
  );
}
