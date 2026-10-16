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
import { MollyButton } from "@/components/ui/molly";
import { useTourController } from "@/hooks/use-tour-controller";
import { stateLabel } from "@/lib/tour/fsm";
import { useTourStore } from "@/stores/use-tour-store";
import type { POI } from "@/types";

interface Props {
  pois: POI[];
}

/**
 * Tour control panel — Start / Stop / Restart / Skip and waypoint list.
 *
 * All commands route through useTourController → /tour/cmd. The robot
 * is authoritative on state; the UI only reflects what /tour/state
 * publishes back (with brief optimistic transients for snappy feel).
 */
export function TourControl({ pois }: Props) {
  const ctrl = useTourController();
  const state = useTourStore((s) => s.state);
  const activePoiId = useTourStore((s) => s.activePoiId);
  const elapsed = useTourStore((s) => s.elapsed);
  const errorReason = useTourStore((s) => s.errorReason);

  const isStarting = state === "STARTING";
  const isStopping = state === "STOPPING";
  const isPending = isStarting || isStopping;
  const isPaused = state === "PAUSED";
  const isRunning = state === "RUNNING";
  const isError = state === "ERROR";

  const handleStart = () => {
    if (pois.length === 0) return;
    ctrl.sendCommand({ kind: "START", poiIds: pois.map((p) => p.id) });
  };

  const handleStop = () => {
    ctrl.sendCommand({ kind: "STOP" });
  };

  const handlePauseResume = () => {
    ctrl.sendCommand({ kind: isPaused ? "RESUME" : "PAUSE" });
  };

  const handleRestart = () => {
    if (pois.length === 0) return;
    ctrl.restart(pois.map((p) => p.id));
  };

  const handleSkip = () => {
    ctrl.sendCommand({ kind: "SKIP" });
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Primary row — Start / Stop */}
      <div className="flex gap-1.5">
        <MollyButton
          onClick={handleStart}
          disabled={!ctrl.canSend("START") || pois.length === 0 || isPending}
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
          onClick={handleStop}
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
          onClick={handlePauseResume}
          disabled={(!isRunning && !isPaused) || isPending}
          variant="secondary"
          className="flex-1 text-xs"
        >
          {isPaused ? <Play size={12} /> : <Pause size={12} />}
          {isPaused ? "Resume" : "Pause"}
        </MollyButton>

        <MollyButton
          onClick={handleRestart}
          disabled={pois.length === 0 || isPending}
          variant="secondary"
          className="flex-1 text-xs"
        >
          <RotateCcw size={12} />
          Restart
        </MollyButton>

        <MollyButton
          onClick={handleSkip}
          disabled={!ctrl.canSend("SKIP")}
          variant="secondary"
          className="flex-1 text-xs"
        >
          <SkipForward size={12} />
          Skip
        </MollyButton>
      </div>

      {/* Status row */}
      <div className="panel-inset px-2.5 py-1.5 flex items-center justify-between">
        <span
          className={`label ${
            isError ? "text-red" : isRunning ? "text-cyan" : ""
          }`}
        >
          {stateLabel(state)}
        </span>
        {isRunning && (
          <span className="font-mono text-[10px] text-txt-muted">
            {formatElapsed(elapsed)}
          </span>
        )}
      </div>

      {isError && errorReason && (
        <div className="text-[10px] text-red border-l-2 border-red px-2 py-1.5 bg-red/5">
          {errorReason}
        </div>
      )}

      {/* Waypoints */}
      <div className="flex flex-col gap-1">
        <span className="label">Waypoints ({pois.length})</span>

        <div className="max-h-36 overflow-y-auto">
          {pois.map((poi, i) => {
            const isActive = poi.id === activePoiId;

            return (
              <div
                key={poi.id}
                className={`px-2.5 py-1.5 flex items-center justify-between border-l-2 transition-colors ${
                  isActive
                    ? "border-l-cyan bg-cyan/5"
                    : "border-l-border-subtle"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-txt-muted font-bold w-4">
                    {i + 1}
                  </span>
                  <span
                    className={`text-xs ${
                      isActive ? "text-cyan" : "text-txt-secondary"
                    }`}
                  >
                    {poi.name}
                  </span>
                </div>

                {isActive && <ChevronRight size={12} className="text-cyan" />}
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
