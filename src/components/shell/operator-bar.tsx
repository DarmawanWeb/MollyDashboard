"use client";

import { EstopButton } from "@/components/layout/dashboard/estop-button";
import { ActivityBadge } from "@/components/robot";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { navItemFor } from "@/constants/nav";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import { useRobotStore } from "@/stores/use-robot-store";

const CONNECTION = {
  connected: { label: "Connected", dot: "bg-green" },
  reconnecting: { label: "Reconnecting", dot: "bg-amber animate-pulse-dot" },
  disconnected: { label: "Disconnected", dot: "bg-red" },
  demo: { label: "Demo robot", dot: "bg-amber" },
} as const;

/** rosbridge state, or "Demo robot" on a USE_MOCKS build. */
export function ConnectionPill({ className }: { className?: string }) {
  const status = useRobotStore((s) => s.connectionStatus);
  const style = env.USE_MOCKS ? CONNECTION.demo : CONNECTION[status];
  return (
    <span
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-2 rounded-lg border border-border-subtle bg-mol-secondary px-2.5 text-xs font-medium text-txt-secondary",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}

/** Top bar of the operator pages: page title, robot state, e-stop, theme. */
export function OperatorBar({ pathname }: { pathname: string }) {
  const item = navItemFor(pathname);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-[0.95rem] font-semibold leading-tight tracking-tight">
          {item.label}
        </h1>
        <p className="hidden truncate text-xs text-txt-tertiary @2xl:block">
          {item.subtitle}
        </p>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <ActivityBadge className="hidden @4xl:flex" />
        <ConnectionPill className="hidden @3xl:inline-flex" />
        <EstopButton />
        <ThemeToggle />
      </div>
    </div>
  );
}
