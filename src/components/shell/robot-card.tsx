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
  demo: { label: "Demo", dot: "bg-amber" },
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
          "rounded-xl border border-border-subtle bg-mol-secondary p-3 shadow-card",
          "lg:sb-collapsed:border-transparent lg:sb-collapsed:bg-transparent lg:sb-collapsed:p-0 lg:sb-collapsed:shadow-none",
        )}
      >
        <div className="flex items-center gap-2.5 lg:sb-collapsed:justify-center">
          <span className="relative grid size-8 shrink-0 place-items-center rounded-lg bg-mol-tertiary">
            <Bot className="size-4 text-txt-secondary" />
            <span
              className={cn(
                "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-mol-secondary lg:sb-collapsed:ring-mol-primary",
                status.dot,
              )}
            />
          </span>
          <div className="min-w-0 flex-1 lg:sb-collapsed:hidden">
            <div className="text-[0.8rem] font-medium">Molly</div>
            <div className="truncate text-[0.7rem] text-txt-tertiary">
              {line}
            </div>
          </div>
          <span className="text-[0.75rem] font-medium tabular-nums text-txt-secondary lg:sb-collapsed:hidden">
            {pct === null ? "—" : `${pct}%`}
          </span>
        </div>

        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-mol-tertiary lg:sb-collapsed:hidden">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-700",
              pct !== null && pct <= 25 ? "bg-orange" : "bg-brand",
            )}
            style={{ width: `${pct ?? 0}%` }}
          />
        </div>
      </div>
    </NavTooltip>
  );
}
