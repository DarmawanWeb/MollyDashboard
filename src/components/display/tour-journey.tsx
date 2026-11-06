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
import { Chip, DisplayCard } from "./display-card";

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

function Stepper({
  stops,
  current,
  copy,
}: {
  stops: POI[];
  current: number;
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
      className="flex snap-x items-start overflow-x-auto pb-1 [scrollbar-width:none]"
    >
      {stops.map((poi, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li
            key={poi.id}
            className="relative flex min-w-[7.5rem] flex-1 snap-center flex-col items-center gap-2 px-1 text-center"
          >
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-[1.125rem] right-1/2 left-[-50%] z-0 h-1 rounded-full",
                  i <= current ? "bg-gradient-brand" : "bg-border",
                )}
              />
            )}
            <span className="relative z-10 grid size-10 place-items-center">
              {now && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-brand/40 animate-ping-soft"
                />
              )}
              <span
                className={cn(
                  "relative grid size-10 place-items-center rounded-full border-2 text-sm font-bold",
                  done && "border-transparent bg-gradient-brand text-on-brand",
                  now && "border-brand bg-mol-secondary text-brand shadow-card",
                  !done &&
                    !now &&
                    "border-border bg-mol-secondary text-txt-muted",
                )}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
              </span>
            </span>
            <span
              className={cn(
                "line-clamp-2 text-[0.8rem] leading-tight",
                now
                  ? "font-bold text-txt-primary"
                  : "font-medium text-txt-tertiary",
              )}
            >
              {poi.name}
            </span>
            {now && (
              <span className="rounded-full bg-brand/12 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-brand">
                {copy.journey.now}
              </span>
            )}
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
      <div className="grid min-h-0 grid-flow-col auto-cols-[minmax(9rem,1fr)] gap-3 overflow-x-auto pb-1">
        {pois.slice(0, 8).map((poi, i) => (
          <article
            key={poi.id}
            className="flex min-w-0 animate-rise-in flex-col gap-1.5 rounded-2xl border border-border-subtle bg-mol-tertiary p-3.5"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-on-brand">
                {i + 1}
              </span>
              <h3 className="truncate text-sm font-bold">{poi.name}</h3>
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {copy.meet.facts.map((fact, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div
              key={fact.title}
              className="flex items-start gap-2.5 rounded-2xl border border-border-subtle bg-mol-tertiary p-3"
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-brand" />
              <div className="min-w-0">
                <div className="text-sm font-bold">{fact.title}</div>
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
  const count = total || stops.length;
  const current = Math.max(0, index);
  // the walk to a stop counts as half way there
  const progress = touring
    ? Math.min(
        1,
        (current + (activity === "navigating" ? 0.4 : 1)) / Math.max(1, count),
      )
    : 0;

  const chip = touring ? (
    <Chip
      className={cn(
        state === "PAUSED"
          ? "border-amber/30 bg-amber/10 text-amber"
          : "border-green/30 bg-green/10 text-green",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          state === "PAUSED" ? "bg-amber" : "bg-green animate-pulse-dot",
        )}
      />
      {state === "PAUSED" ? copy.journey.paused : copy.journey.running}
    </Chip>
  ) : (
    <Chip>{offline ? copy.status.offline : copy.journey.ready}</Chip>
  );

  return (
    <DisplayCard
      icon={<Compass />}
      title={
        touring && tourName ? (
          <>
            {copy.journey.title}
            <span className="font-medium text-txt-tertiary"> · {tourName}</span>
          </>
        ) : touring ? (
          copy.journey.title
        ) : offline ? (
          copy.journey.restingTitle
        ) : (
          copy.journey.exploreTitle
        )
      }
      aside={chip}
      className={className}
    >
      {touring ? (
        <div className="flex h-full flex-col gap-3 px-5 pb-5">
          <Stepper stops={stops} current={current} copy={copy} />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className="text-base font-semibold">{copy.story(story)}</p>
            <span className="text-sm font-semibold text-txt-tertiary tabular-nums">
              {copy.journey.stopOf(current + 1, count)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-mol-tertiary">
            <div
              className="h-full rounded-full bg-gradient-brand transition-[width] duration-1000 ease-out"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
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
