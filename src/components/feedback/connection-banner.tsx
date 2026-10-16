"use client";

import { Loader2, WifiOff } from "lucide-react";
import { useRobotStore } from "@/stores/use-robot-store";

/**
 * Slim banner shown above the dashboard when connection is degraded.
 *
 * Hidden entirely when connected — operators only see it when something
 * is wrong. Distinct from the footer status pill (which always shows the
 * current state) because operators don't always look at the footer.
 *
 * Two states render:
 *   - reconnecting: amber, with spinner
 *   - disconnected: red, with offline icon
 */
export function ConnectionBanner() {
  const status = useRobotStore((s) => s.connectionStatus);

  if (status === "connected") return null;

  const isReconnecting = status === "reconnecting";

  return (
    <div
      aria-live="polite"
      className={`shrink-0 px-4 py-1.5 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider border-b ${
        isReconnecting
          ? "bg-amber/10 border-amber/30 text-amber"
          : "bg-red/10 border-red/30 text-red"
      }`}
    >
      {isReconnecting ? (
        <Loader2 size={12} className="motion-safe:animate-spin" />
      ) : (
        <WifiOff size={12} />
      )}
      <span>
        {isReconnecting
          ? "Reconnecting to rosbridge…"
          : "Disconnected from rosbridge — showing mock data"}
      </span>
    </div>
  );
}
