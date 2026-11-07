"use client";

import { EstopButton } from "@/components/layout/dashboard/estop-button";
import { ActivityBadge } from "@/components/robot";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { navItemFor } from "@/constants/nav";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import { useRobotStore } from "@/stores/use-robot-store";

const CONNECTION = {
  connected: {
    label: "Connected",
    dot: "bg-green",
    tone: "border-green/30 bg-green/10 text-green",
  },
  reconnecting: {
    label: "Reconnecting",
    dot: "bg-amber animate-pulse-dot",
    tone: "border-amber/30 bg-amber/10 text-amber",
  },
  disconnected: {
    label: "Disconnected",
    dot: "bg-red",
    tone: "border-red/30 bg-red/10 text-red",
  },
  demo: {
    label: "Demo robot",
    dot: "bg-amber",
    tone: "border-amber/30 bg-amber/10 text-amber",
  },
} as const;

/** rosbridge state, or "Demo robot" on a USE_MOCKS build. */
export function ConnectionPill({ className }: { className?: string }) {
  const status = useRobotStore((s) => s.connectionStatus);
  const style = env.USE_MOCKS ? CONNECTION.demo : CONNECTION[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        style.tone,
        className,
      )}
    >
      <span className={cn("size-2 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}

/** Top bar of the operator pages: page title, robot state, e-stop, theme. */
export function OperatorBar({ pathname }: { pathname: string }) {
  const item = navItemFor(pathname);
  const Icon = item.icon;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <span className="hidden size-10 shrink-0 place-items-center rounded-xl bg-brand/12 text-brand @md:grid">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <h1 className="truncate text-lg font-extrabold leading-tight tracking-tight">
          {item.label}
        </h1>
        <p className="hidden truncate text-xs text-txt-tertiary @2xl:block">
          {item.subtitle}
        </p>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2 @xl:gap-3">
        <ActivityBadge className="hidden @4xl:flex" />
        <ConnectionPill className="hidden @3xl:inline-flex" />
        <EstopButton />
        <ThemeToggle />
      </div>
    </div>
  );
}
