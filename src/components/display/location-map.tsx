"use client";

import { MapPin, MapPinOff } from "lucide-react";
import { ErrorBoundary } from "@/components/error";
import { RobotMap } from "@/components/map/robot-map";
import type { DisplayMode } from "@/hooks/use-display-mode";
import type { DisplayCopy } from "@/lib/display/copy";
import type { Story } from "@/lib/display/story";
import { Chip, DisplayCard } from "./display-card";

function Legend({ copy }: { copy: DisplayCopy }) {
  return (
    <div className="pointer-events-none absolute top-2.5 right-2.5 flex flex-wrap items-center gap-2.5 rounded-full border border-border-subtle bg-mol-secondary/85 px-2.5 py-1 text-[0.66rem] font-semibold text-txt-secondary shadow-card backdrop-blur">
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-cyan ring-4 ring-cyan/20" />
        {copy.map.molly}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2 rotate-45 bg-violet" />
        {copy.map.stops}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-orange" />
        {copy.map.visitors}
      </span>
    </div>
  );
}

/** Where Molly is on the floor plan, with the stops and visitors. */
export function LocationMap({
  mode,
  story,
  copy,
  className,
}: {
  mode: DisplayMode;
  story: Story;
  copy: DisplayCopy;
  className?: string;
}) {
  const offline = mode === "offline";

  return (
    <DisplayCard
      icon={<MapPin />}
      title={copy.map.title}
      aside={
        !offline && story.place ? (
          <Chip>{copy.map.near(story.place)}</Chip>
        ) : null
      }
      className={className}
      bodyClassName="relative mx-3 mb-3 overflow-hidden rounded-2xl border border-border-subtle"
    >
      {offline ? (
        <div className="grid h-full min-h-40 place-items-center bg-mol-tertiary p-6 text-center">
          <div className="flex flex-col items-center gap-2 text-txt-tertiary">
            <MapPinOff className="size-7" />
            <span className="text-sm font-semibold">{copy.map.noMap}</span>
          </div>
        </div>
      ) : (
        <ErrorBoundary>
          <div className="absolute inset-0">
            <RobotMap variant="display" showPoiLabels />
          </div>
          <Legend copy={copy} />
        </ErrorBoundary>
      )}
    </DisplayCard>
  );
}
