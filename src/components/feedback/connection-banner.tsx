"use client";

import { Loader2, Settings, WifiOff } from "lucide-react";
import Link from "next/link";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import { useRobotStore } from "@/stores/use-robot-store";

/**
 * Notice above the operator pages while the robot is not connected: the
 * pages show the demo robot meanwhile. Hidden when connected, and on demo
 * builds (USE_MOCKS), where the demo robot is the point.
 */
export function ConnectionBanner() {
  const status = useRobotStore((s) => s.connectionStatus);

  if (status === "connected" || env.USE_MOCKS) return null;

  const reconnecting = status === "reconnecting";

  return (
    <div className="shrink-0 px-3 pt-3 lg:px-4">
      <div
        aria-live="polite"
        className={cn(
          "flex items-center gap-3 rounded-lg border border-border-subtle bg-mol-secondary px-3.5 py-2 text-sm shadow-card",
          reconnecting ? "text-amber" : "text-red",
        )}
      >
        {reconnecting ? (
          <Loader2 className="size-4 shrink-0 motion-safe:animate-spin" />
        ) : (
          <WifiOff className="size-4 shrink-0" />
        )}
        <span className="min-w-0 flex-1 truncate">
          <span className="font-medium text-txt-primary">
            {reconnecting
              ? "Reconnecting to the robot…"
              : "Robot not connected."}
          </span>{" "}
          <span className="text-txt-tertiary">
            These pages show the demo robot until it is.
          </span>
        </span>
        <Link
          href="/settings"
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-txt-secondary transition-colors hover:bg-mol-tertiary hover:text-txt-primary"
        >
          <Settings className="size-3.5" />
          Connection
        </Link>
      </div>
    </div>
  );
}
