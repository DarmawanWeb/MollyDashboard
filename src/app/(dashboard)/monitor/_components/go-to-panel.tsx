"use client";

import { Loader2, Navigation, Square } from "lucide-react";
import { MollyButton } from "@/components/ui/molly";
import { useRobotAction } from "@/hooks/use-robot-action";
import { useRobotApi } from "@/hooks/use-robot-api";
import { isWalking } from "@/lib/navigation/codec";
import { cn } from "@/lib/utils";
import { useNavigationStore } from "@/stores/use-navigation-store";
import { useRobotStore } from "@/stores/use-robot-store";
import { useSiteStore } from "@/stores/use-site-store";
import { useTourStore } from "@/stores/use-tour-store";
import type { PlannerState } from "@/types";

const STATE_TONE: Record<PlannerState, string> = {
  idle: "text-txt-tertiary",
  planning: "text-cyan",
  following: "text-cyan",
  replanning: "text-amber",
  arrived: "text-green",
  failed: "text-red",
  cancelled: "text-txt-tertiary",
};

/**
 * Walk to a POI with the path finder (planner/go_to), outside of a tour.
 */
export function GoToPanel() {
  const api = useRobotApi();
  const { run, busy } = useRobotAction();
  const pois = useSiteStore((s) => s.pois);
  const planner = useNavigationStore((s) => s.planner);
  const navigation = useNavigationStore((s) => s.navigation);
  const localized = useRobotStore((s) => s.localization.localized);
  const touring = useTourStore(
    (s) => s.state !== "IDLE" && s.state !== "ERROR",
  );

  const walking = isWalking(planner.state);
  const goalName =
    pois.find((p) => p.id === planner.goalId)?.name ||
    (planner.goal ? "pose" : "—");

  return (
    <div className="flex flex-col gap-2">
      <div className="panel-inset px-2.5 py-1.5 flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("label", STATE_TONE[planner.state])}>
            {planner.state}
            {planner.state !== "idle" ? ` · ${goalName}` : ""}
          </span>
          {walking && (
            <span className="font-mono text-[10px] text-txt-muted">
              {planner.remaining.toFixed(1)} m left
              {planner.replans > 0 ? ` · ${planner.replans} replans` : ""}
            </span>
          )}
        </div>
        {(planner.message || navigation.state === "BLOCKED") && (
          <span className="text-[10px] text-txt-tertiary font-mono truncate">
            {navigation.state === "BLOCKED"
              ? `blocked: ${navigation.message || "path obstructed"}`
              : planner.message}
          </span>
        )}
      </div>

      {!localized && (
        <div className="text-[10px] text-amber border-l-2 border-amber px-2 py-1 bg-amber/5">
          Not localized — localize from an AprilTag first.
        </div>
      )}

      <div className="flex flex-col gap-1 max-h-44 overflow-y-auto">
        {pois.length === 0 && (
          <div className="text-[10px] text-txt-muted py-2">No POIs.</div>
        )}
        {pois.map((poi) => {
          const isGoal = walking && planner.goalId === poi.id;
          return (
            <div
              key={poi.id}
              className={cn(
                "px-2.5 py-1 flex items-center justify-between gap-2 border-l-2",
                isGoal ? "border-l-cyan bg-cyan/5" : "border-l-border-subtle",
              )}
            >
              <span
                className={cn(
                  "text-xs truncate",
                  isGoal ? "text-cyan" : "text-txt-secondary",
                )}
              >
                {poi.name}
              </span>
              <MollyButton
                variant="ghost"
                size="xs"
                disabled={!localized || touring || busy !== null}
                onClick={() =>
                  run(`go-${poi.id}`, `Walk to ${poi.name}`, () =>
                    api.goToPoi(poi.id),
                  )
                }
                aria-label={`Walk to ${poi.name}`}
              >
                {busy === `go-${poi.id}` ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <Navigation size={10} />
                )}
                Go
              </MollyButton>
            </div>
          );
        })}
      </div>

      <MollyButton
        variant="danger"
        size="sm"
        disabled={!walking || busy === "cancel"}
        onClick={() => run("cancel", "Cancel walk", () => api.cancelGoTo())}
      >
        <Square size={12} /> Cancel walk
      </MollyButton>
    </div>
  );
}
