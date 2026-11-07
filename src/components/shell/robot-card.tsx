"use client";

import { Bot } from "lucide-react";
import { ACTIVITY_STATES } from "@/constants/activity-states";
import { type DisplayMode, useDisplayMode } from "@/hooks/use-display-mode";
import { useRobotActivity } from "@/hooks/use-robot-activity";
import { cn } from "@/lib/utils";
import { useRobotStore } from "@/stores/use-robot-store";
import { useUiStore } from "@/stores/use-ui-store";
import { NavTooltip } from "./nav-tooltip";

const STATUS: Record<DisplayMode, { label: string; dot: string }> = {
  live: { label: "Online", dot: "bg-green" },
  demo: { label: "Demo robot", dot: "bg-amber" },
  offline: { label: "Offline", dot: "bg-txt-muted" },
};

/**
 * Molly at a glance at the bottom of the sidebar: online, what she does,
 * battery. Offline it shows no numbers (the operator pages may be on the
 * mock robot then).
 */
export function RobotCard() {
  const mode = useDisplayMode();
  const activity = ACTIVITY_STATES[useRobotActivity()].label;
  const battery = useRobotStore((s) => s.battery?.percentage ?? null);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  const pct =
    mode === "offline" || battery === null ? null : Math.round(battery);
  const status = STATUS[mode];
  const line =
    mode === "offline" ? status.label : `${status.label} · ${activity}`;

  return (
    <NavTooltip
      enabled={collapsed}
      label={`Molly · ${line}${pct === null ? "" : ` · ${pct}%`}`}
    >
      <div
        className={cn(
          "rounded-2xl border border-border-subtle bg-mol-tertiary/70 p-3",
          "lg:sb-collapsed:border-transparent lg:sb-collapsed:bg-transparent lg:sb-collapsed:p-0",
        )}
      >
        <div className="flex items-center gap-3 lg:sb-collapsed:justify-center">
          <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-mol-secondary ring-1 ring-border-subtle">
            <Bot className="size-5 text-brand" />
            <span
              className={cn(
                "absolute -right-0.5 -bottom-0.5 size-3 rounded-full ring-2 ring-mol-primary",
                status.dot,
                mode === "live" && "animate-pulse-dot",
              )}
            />
          </span>
          <div className="min-w-0 lg:sb-collapsed:hidden">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold">Molly</span>
              <span className="text-[0.65rem] font-semibold text-txt-muted">
                Lite3
              </span>
            </div>
            <div className="truncate text-xs text-txt-tertiary">{line}</div>
          </div>
        </div>

        <div className="mt-3 lg:sb-collapsed:hidden">
          <div className="mb-1 flex justify-between text-[0.7rem] font-semibold text-txt-tertiary">
            <span>Battery</span>
            <span className="tabular-nums text-txt-secondary">
              {pct === null ? "—" : `${pct}%`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-mol-elevated">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-700",
                pct !== null && pct <= 25 ? "bg-orange" : "bg-gradient-brand",
              )}
              style={{ width: `${pct ?? 0}%` }}
            />
          </div>
        </div>
      </div>
    </NavTooltip>
  );
}
