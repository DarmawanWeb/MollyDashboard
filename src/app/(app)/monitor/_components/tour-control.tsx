"use client";

import {
  ChevronRight,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Square,
} from "lucide-react";
import { useState } from "react";
import { MollyButton, MollySelect } from "@/components/ui/molly";
import { useTourController } from "@/hooks/use-tour-controller";
import { stateLabel } from "@/lib/tour/fsm";
import { activityLabel } from "@/lib/tour/messages";
import { useSiteStore } from "@/stores/use-site-store";
import { useTourStore } from "@/stores/use-tour-store";
import type { POI, TourCommand, TourDefinition } from "@/types";

/** Select value for "every POI of the site, in list order". */
const ALL_POIS = "__all__";

type StartCommand = Extract<TourCommand, { kind: "START" }>;

function startCommand(selection: string, pois: POI[]): StartCommand {
  return selection === ALL_POIS
    ? { kind: "START", tourId: "", poiIds: pois.map((p) => p.id) }
    : { kind: "START", tourId: selection, poiIds: [] };
}

/** Stops of a tour (or all POIs), resolved to POIs that still exist. */
function stopsOf(tour: TourDefinition | undefined, pois: POI[]): POI[] {
  if (!tour) return pois;
  return tour.poiIds
    .map((id) => pois.find((p) => p.id === id))
    .filter((p): p is POI => p !== undefined);
}

/**
 * Tour control panel — pick a tour, Start / Stop / Pause / Restart / Skip,
 * and follow the stops.
 *
 * All commands route through useTourController → /tour/control. The robot
 * is authoritative on state; the UI only reflects what /tour/state
 * publishes back (with brief optimistic transients for snappy feel).
 */
export function TourControl() {
  const ctrl = useTourController();
  const pois = useSiteStore((s) => s.pois);
  const tours = useSiteStore((s) => s.tours);
  const state = useTourStore((s) => s.state);
  const runningTourId = useTourStore((s) => s.tourId);
  const runningTourName = useTourStore((s) => s.tourName);
  const activePoiId = useTourStore((s) => s.activePoiId);
  const activity = useTourStore((s) => s.activity);
  const message = useTourStore((s) => s.message);
  const elapsed = useTourStore((s) => s.elapsed);
  const errorReason = useTourStore((s) => s.errorReason);

  const [selection, setSelection] = useState<string>(ALL_POIS);
  const selected = tours.find((t) => t.id === selection);

  const isStarting = state === "STARTING";
  const isStopping = state === "STOPPING";
  const isPending = isStarting || isStopping;
  const isPaused = state === "PAUSED";
  const isRunning = state === "RUNNING";
  const isError = state === "ERROR";
  const isActive = isRunning || isPaused;

  const shownTour = isActive
    ? tours.find((t) => t.id === runningTourId)
    : selected;
  const stops = stopsOf(shownTour, pois);
  const canStart =
    selection === ALL_POIS
      ? pois.length > 0
      : (selected?.poiIds.length ?? 0) > 0;

  const options = [
    { value: ALL_POIS, label: `All POIs (${pois.length})` },
    ...tours.map((t) => ({
      value: t.id,
      label: `${t.name} (${t.poiIds.length})`,
    })),
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <MollySelect
        id="tour-select"
        ariaLabel="Tour to run"
        value={selected || selection === ALL_POIS ? selection : ALL_POIS}
        onChange={setSelection}
        options={options}
        size="sm"
        disabled={isActive || isPending}
      />

      {/* Primary row — Start / Stop */}
      <div className="flex gap-1.5">
        <MollyButton
          onClick={() => ctrl.sendCommand(startCommand(selection, pois))}
          disabled={!ctrl.canSend("START") || !canStart || isPending}
          className="flex-1"
        >
          {isStarting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Play size={14} />
          )}
          {isStarting ? "Starting…" : "Start"}
        </MollyButton>

        <MollyButton
          onClick={() => ctrl.sendCommand({ kind: "STOP" })}
          disabled={!ctrl.canSend("STOP") || isPending}
          variant="danger"
          className="flex-1"
        >
          {isStopping ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Square size={14} />
          )}
          {isStopping ? "Stopping…" : "Stop"}
        </MollyButton>
      </div>

      {/* Secondary row — Pause/Resume / Restart / Skip */}
      <div className="flex gap-1.5">
        <MollyButton
          onClick={() =>
            ctrl.sendCommand({ kind: isPaused ? "RESUME" : "PAUSE" })
          }
          disabled={!isActive || isPending}
          variant="secondary"
          className="flex-1 text-xs"
        >
          {isPaused ? <Play size={12} /> : <Pause size={12} />}
          {isPaused ? "Resume" : "Pause"}
        </MollyButton>

        <MollyButton
          onClick={() => ctrl.restart(startCommand(selection, pois))}
          disabled={!canStart || isPending}
          variant="secondary"
          className="flex-1 text-xs"
        >
          <RotateCcw size={12} />
          Restart
        </MollyButton>

        <MollyButton
          onClick={() => ctrl.sendCommand({ kind: "SKIP" })}
          disabled={!ctrl.canSend("SKIP")}
          variant="secondary"
          className="flex-1 text-xs"
        >
          <SkipForward size={12} />
          Skip
        </MollyButton>
      </div>

      {/* Status row */}
      <div className="panel-inset px-2.5 py-1.5 flex items-center justify-between gap-2">
        <span
          className={`label ${
            isError ? "text-red" : isRunning ? "text-cyan" : ""
          }`}
        >
          {stateLabel(state)}
          {isActive && activity ? ` · ${activityLabel(activity)}` : ""}
        </span>
        {isRunning && (
          <span className="font-mono text-[10px] text-txt-muted">
            {formatElapsed(elapsed)}
          </span>
        )}
      </div>

      {isActive && (runningTourName || message) && (
        <div className="text-[10px] text-txt-tertiary font-mono truncate">
          {runningTourName && (
            <span className="text-cyan">{runningTourName}</span>
          )}
          {runningTourName && message ? " · " : ""}
          {message}
        </div>
      )}

      {isError && errorReason && (
        <div className="text-[10px] text-red border-l-2 border-red px-2 py-1.5 bg-red/5">
          {errorReason}
        </div>
      )}

      {/* Stops */}
      <div className="flex flex-col gap-1">
        <span className="label">Stops ({stops.length})</span>

        {stops.length === 0 && (
          <div className="text-[10px] text-txt-muted py-2">
            No POIs on this site yet — add them on the Mapping page.
          </div>
        )}

        <div className="max-h-36 overflow-y-auto">
          {stops.map((poi, i) => {
            const isCurrent = isActive && poi.id === activePoiId;

            return (
              <div
                key={`${poi.id}-${i}`}
                className={`px-2.5 py-1.5 flex items-center justify-between border-l-2 transition-colors ${
                  isCurrent
                    ? "border-l-cyan bg-cyan/5"
                    : "border-l-border-subtle"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[10px] text-txt-muted font-bold w-4">
                    {i + 1}
                  </span>
                  <span
                    className={`text-xs truncate ${
                      isCurrent ? "text-cyan" : "text-txt-secondary"
                    }`}
                  >
                    {poi.name}
                  </span>
                </div>

                {isCurrent && <ChevronRight size={12} className="text-cyan" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
