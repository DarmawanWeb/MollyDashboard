"use client";

import {
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  Footprints,
  MessageCircleQuestion,
  Route,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import type { DisplayMode } from "@/hooks/use-display-mode";
import { useHydrated } from "@/hooks/use-hydrated";
import type { DisplayCopy } from "@/lib/display/copy";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/stores/use-conversation-store";
import { today, useDailyStatsStore } from "@/stores/use-daily-stats-store";
import { useInteractionStore } from "@/stores/use-interaction-store";
import { useRobotStore } from "@/stores/use-robot-store";

function Tile({
  icon,
  tint,
  label,
  value,
  unit,
  hint,
  children,
}: {
  icon: ReactNode;
  /** Classes for the icon badge */
  tint: string;
  label: string;
  value: string;
  unit?: string;
  hint: string;
  children?: ReactNode;
}) {
  return (
    <div className="display-card flex min-w-0 items-center gap-3 px-3.5 py-3">
      <span
        aria-hidden
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-2xl [&>svg]:size-5",
          tint,
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-[0.72rem] font-semibold leading-tight text-txt-tertiary">
          {label}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-extrabold text-[1.65rem] leading-tight tabular-nums tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-semibold text-txt-tertiary">
              {unit}
            </span>
          )}
        </div>
        {children ?? (
          <div className="hidden truncate text-[0.68rem] text-txt-muted @2xl:block">
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Today at a glance: people around, questions, tours, distance, battery. */
export function StatTiles({
  mode,
  copy,
  className,
}: {
  mode: DisplayMode;
  copy: DisplayCopy;
  className?: string;
}) {
  const hydrated = useHydrated();
  const offline = mode === "offline";
  const visitors = useInteractionStore((s) => s.visitors.count);
  const battery = useRobotStore((s) => s.battery?.percentage ?? null);
  const questions = useConversationStore(
    (s) =>
      s.entries.filter((e) => e.ok && !e.pending && e.at >= startOfToday())
        .length,
  );
  const stats = useDailyStatsStore();
  const fresh = hydrated && stats.day === today();
  const tours = fresh ? stats.toursStarted : 0;
  const meters = fresh ? stats.distanceM : 0;

  const pct = offline || battery === null ? null : Math.round(battery);
  const BatteryIcon =
    pct === null || pct > 60
      ? BatteryFull
      : pct > 25
        ? BatteryMedium
        : BatteryLow;
  const batteryTint =
    pct === null
      ? "bg-mol-tertiary text-txt-tertiary"
      : pct > 25
        ? "bg-green/12 text-green"
        : "bg-orange/12 text-orange";

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 @2xl:grid-cols-3 @5xl:grid-cols-5",
        className,
      )}
    >
      <Tile
        icon={<Users />}
        tint="bg-brand/12 text-brand"
        label={copy.stats.visitors}
        value={offline ? "—" : String(visitors)}
        hint={copy.stats.visitorsHint}
      />
      <Tile
        icon={<MessageCircleQuestion />}
        tint="bg-violet/12 text-violet"
        label={copy.stats.questions}
        value={hydrated ? String(questions) : "—"}
        hint={copy.stats.questionsHint}
      />
      <Tile
        icon={<Route />}
        tint="bg-cyan/12 text-cyan"
        label={copy.stats.tours}
        value={hydrated ? String(tours) : "—"}
        hint={copy.stats.toursHint}
      />
      <Tile
        icon={<Footprints />}
        tint="bg-amber/12 text-amber"
        label={copy.stats.distance}
        value={
          !hydrated
            ? "—"
            : meters >= 1000
              ? (meters / 1000).toFixed(1)
              : String(Math.round(meters))
        }
        unit={meters >= 1000 ? "km" : "m"}
        hint={copy.stats.distanceHint}
      />
      <Tile
        icon={<BatteryIcon />}
        tint={batteryTint}
        label={copy.stats.battery}
        value={pct === null ? "—" : String(pct)}
        unit={pct === null ? undefined : "%"}
        hint=""
      >
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-mol-tertiary">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-700",
              pct !== null && pct <= 25 ? "bg-orange" : "bg-gradient-brand",
            )}
            style={{ width: `${pct ?? 0}%` }}
          />
        </div>
      </Tile>
    </div>
  );
}
