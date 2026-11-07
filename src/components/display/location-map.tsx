"use client";

import { MapPin, MapPinOff } from "lucide-react";
import { ErrorBoundary } from "@/components/error";
import { RobotMap } from "@/components/map/robot-map";
import type { DisplayMode } from "@/hooks/use-display-mode";
import type { DisplayCopy } from "@/lib/display/copy";
import type { Story } from "@/lib/display/story";
import { DisplayCard } from "./display-card";

function Legend({ copy }: { copy: DisplayCopy }) {
  return (
    <div className="hidden shrink-0 items-center gap-3 text-xs text-txt-tertiary @[30rem]/card:flex">
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-brand ring-2 ring-brand/25" />
        {copy.map.molly}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-[0.45rem] rotate-45 rounded-[1px] bg-txt-secondary" />
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
      subtitle={!offline && story.place ? copy.map.near(story.place) : null}
      aside={offline ? null : <Legend copy={copy} />}
      className={className}
      bodyClassName="relative mx-3 mb-3 overflow-hidden rounded-xl border border-border-subtle"
    >
      {offline ? (
        <div className="grid h-full min-h-40 place-items-center bg-mol-tertiary p-6 text-center">
          <div className="flex flex-col items-center gap-2 text-txt-tertiary">
            <MapPinOff className="size-6" />
            <span className="text-sm font-medium">{copy.map.noMap}</span>
          </div>
        </div>
      ) : (
        <ErrorBoundary>
          <div className="absolute inset-0">
            <RobotMap variant="display" showPoiLabels />
          </div>
        </ErrorBoundary>
      )}
    </DisplayCard>
  );
}
