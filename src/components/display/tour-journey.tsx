"use client";

import { Check, Compass, Footprints, MapPinned, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import type { DisplayMode } from "@/hooks/use-display-mode";
import type { DisplayCopy } from "@/lib/display/copy";
import type { Story } from "@/lib/display/story";
import { cn } from "@/lib/utils";
import { useSiteStore } from "@/stores/use-site-store";
import { useTourStore } from "@/stores/use-tour-store";
import type { POI } from "@/types";
import { Chip, DisplayCard, Dot } from "./display-card";

/** The running tour's stops: its saved list, or every POI for an ad-hoc tour. */
function useTourStops(): POI[] {
  const pois = useSiteStore((s) => s.pois);
  const tours = useSiteStore((s) => s.tours);
  const tourId = useTourStore((s) => s.tourId);
  const tour = tours.find((t) => t.id === tourId);
  if (!tour) return pois;
  return tour.poiIds
    .map((id) => pois.find((p) => p.id === id))
    .filter((p): p is POI => p !== undefined);
}

/**
 * The stops in a row. The line into the current stop fills half way while
 * Molly walks there, and all the way once she has arrived.
 */
function Stepper({
  stops,
  current,
  walking,
  copy,
}: {
  stops: POI[];
  current: number;
  walking: boolean;
  copy: DisplayCopy;
}) {
  const listRef = useRef<HTMLOListElement>(null);

  // keep the current stop in view when the tour has many
  useEffect(() => {
    const el = listRef.current?.children[current] as HTMLElement | undefined;
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [current]);

  return (
    <ol
      ref={listRef}
      className="flex snap-x items-start overflow-x-auto [scrollbar-width:none]"
    >
      {stops.map((poi, i) => {
        const done = i < current;
        const now = i === current;
        const fill = i < current ? 1 : now ? (walking ? 0.5 : 1) : 0;
        return (
          <li
            key={poi.id}
            className="relative flex min-w-[7rem] flex-1 snap-center flex-col items-center gap-2 px-1 text-center"
          >
            {i > 0 && (
              <span
                aria-hidden
                className="absolute top-[0.9375rem] right-[calc(50%+1.5rem)] left-[calc(-50%+1.5rem)] h-0.5 overflow-hidden rounded-full bg-border"
              >
                <span
                  className="block h-full rounded-full bg-brand transition-[width] duration-1000 ease-out"
                  style={{ width: `${fill * 100}%` }}
                />
              </span>
            )}
            <span
              className={cn(
                "relative grid size-8 place-items-center rounded-full text-xs font-semibold transition-colors",
                done && "bg-brand text-on-brand",
                now &&
                  "bg-mol-secondary text-brand ring-2 ring-brand ring-offset-2 ring-offset-mol-secondary",
                !done &&
                  !now &&
                  "bg-mol-secondary text-txt-tertiary ring-1 ring-border",
              )}
            >
              {done ? <Check className="size-4" strokeWidth={2.5} /> : i + 1}
            </span>
            <span
              className={cn(
                "line-clamp-2 text-[0.8rem] leading-tight",
                now
                  ? "font-semibold text-txt-primary"
                  : done
                    ? "text-txt-secondary"
                    : "text-txt-tertiary",
              )}
            >
              {poi.name}
            </span>
            <span
              className={cn(
                "-mt-1 text-[0.7rem] font-medium text-brand",
                !now && "invisible",
              )}
            >
              {copy.journey.now}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Explore({ pois, copy }: { pois: POI[]; copy: DisplayCopy }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 px-5 pb-5">
      <p className="text-sm text-txt-tertiary">{copy.journey.exploreBody}</p>
      <div className="grid min-h-0 grid-flow-col auto-cols-[minmax(9rem,1fr)] gap-3 overflow-x-auto">
        {pois.slice(0, 8).map((poi, i) => (
          <article
            key={poi.id}
            className="flex min-w-0 animate-rise-in flex-col gap-1.5 rounded-xl border border-border-subtle p-3.5"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-center gap-2">
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-mol-tertiary text-xs font-semibold text-txt-secondary tabular-nums">
                {i + 1}
              </span>
              <h3 className="truncate text-sm font-semibold">{poi.name}</h3>
            </div>
            {(poi.description || poi.narration) && (
              <p className="line-clamp-2 text-[0.78rem] leading-snug text-txt-tertiary">
                {poi.description || poi.narration}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function MeetMolly({ copy, note }: { copy: DisplayCopy; note?: string }) {
  const icons = [Footprints, Compass, Sparkles, MapPinned];
  return (
    <div className="flex h-full flex-col gap-3 px-5 pb-5">
      {note && <p className="text-sm text-txt-tertiary">{note}</p>}
      <div className="grid grid-cols-2 gap-3 @4xl:grid-cols-4">
        {copy.meet.facts.map((fact, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div
              key={fact.title}
              className="flex items-start gap-2.5 rounded-xl border border-border-subtle p-3"
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-txt-tertiary" />
              <div className="min-w-0">
                <div className="text-sm font-semibold">{fact.title}</div>
                <div className="text-[0.75rem] leading-snug text-txt-tertiary">
                  {fact.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The tour as a journey: stops done, where Molly is now, what comes next.
 * Between tours it invites visitors to explore the places Molly knows.
 */
export function TourJourney({
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
  const state = useTourStore((s) => s.state);
  const tourName = useTourStore((s) => s.tourName);
  const index = useTourStore((s) => s.currentPoiIndex);
  const total = useTourStore((s) => s.totalPois);
  const activity = useTourStore((s) => s.activity);
  const pois = useSiteStore((s) => s.pois);
  const stops = useTourStops();

  const offline = mode === "offline";
  const touring = !offline && (state === "RUNNING" || state === "PAUSED");
  const paused = state === "PAUSED";
  const count = total || stops.length;
  const current = Math.max(0, index);

  const chip = touring ? (
    <Chip>
      <Dot className={paused ? "bg-amber" : "bg-green"} pulse={!paused} />
      {paused ? copy.journey.paused : copy.journey.running}
    </Chip>
  ) : (
    <Chip>
      <Dot className="bg-txt-muted" />
      {offline ? copy.status.offline : copy.journey.ready}
    </Chip>
  );

  return (
    <DisplayCard
      icon={<Compass />}
      title={
        touring
          ? copy.journey.title
          : offline
            ? copy.journey.restingTitle
            : copy.journey.exploreTitle
      }
      subtitle={touring ? tourName : null}
      aside={chip}
      className={className}
    >
      {touring ? (
        <div className="flex h-full flex-col gap-3 px-5 pt-1 pb-4">
          <Stepper
            stops={stops}
            current={current}
            walking={activity === "navigating"}
            copy={copy}
          />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border-subtle pt-3">
            <p className="text-[0.95rem] font-medium">{copy.story(story)}</p>
            <span className="text-sm text-txt-tertiary tabular-nums">
              {copy.journey.stopOf(current + 1, count)}
            </span>
          </div>
        </div>
      ) : offline ? (
        <MeetMolly copy={copy} note={copy.journey.restingBody} />
      ) : pois.length > 0 ? (
        <Explore pois={pois} copy={copy} />
      ) : (
        <MeetMolly copy={copy} />
      )}
    </DisplayCard>
  );
}
