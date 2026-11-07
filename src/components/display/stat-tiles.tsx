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
  label,
  value,
  unit,
  hint,
  alert = false,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  unit?: string;
  hint: string;
  /** Tints the icon (low battery) */
  alert?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="display-card flex min-w-0 flex-col px-4 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <span className="line-clamp-2 text-[0.8rem] font-medium leading-snug text-txt-secondary">
          {label}
        </span>
        <span
          aria-hidden
          className={cn(
            "mt-px shrink-0 [&>svg]:size-4",
            alert ? "text-orange" : "text-txt-muted",
          )}
        >
          {icon}
        </span>
      </div>
      <div className="mt-auto flex items-baseline gap-1 pt-2">
        <span className="text-[1.75rem] font-semibold leading-none tabular-nums tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-txt-tertiary">{unit}</span>
        )}
      </div>
      {children ?? (
        <div className="mt-2 truncate text-xs text-txt-tertiary">{hint}</div>
      )}
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
  const low = pct !== null && pct <= 25;
  const BatteryIcon =
    pct === null || pct > 60
      ? BatteryFull
      : pct > 25
        ? BatteryMedium
        : BatteryLow;

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 @2xl:grid-cols-3 @5xl:grid-cols-5",
        className,
      )}
    >
      <Tile
        icon={<Users />}
        label={copy.stats.visitors}
        value={offline ? "—" : String(visitors)}
        hint={copy.stats.visitorsHint}
      />
      <Tile
        icon={<MessageCircleQuestion />}
        label={copy.stats.questions}
        value={hydrated ? String(questions) : "—"}
        hint={copy.stats.questionsHint}
      />
      <Tile
        icon={<Route />}
        label={copy.stats.tours}
        value={hydrated ? String(tours) : "—"}
        hint={copy.stats.toursHint}
      />
      <Tile
        icon={<Footprints />}
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
        label={copy.stats.battery}
        value={pct === null ? "—" : String(pct)}
        unit={pct === null ? undefined : "%"}
        hint=""
        alert={low}
      >
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-mol-tertiary">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-700",
              low ? "bg-orange" : "bg-brand",
            )}
            style={{ width: `${pct ?? 0}%` }}
          />
        </div>
      </Tile>
    </div>
  );
}
