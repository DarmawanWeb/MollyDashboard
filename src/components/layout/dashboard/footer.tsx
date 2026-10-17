"use client";

import { useMockMode } from "@/hooks/use-mock-mode";
import { cn } from "@/lib/utils";
import { useRobotStore } from "@/stores/use-robot-store";
import { useSiteStore } from "@/stores/use-site-store";
import { useSystemStore } from "@/stores/use-system-store";

const pct = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : `${Math.round(v)}%`;

export function Footer() {
  const connectionStatus = useRobotStore((state) => state.connectionStatus);
  const site = useSiteStore((s) => s.status.site);
  const health = useSystemStore((s) => s.health);
  const mock = useMockMode();

  const dotClass =
    connectionStatus === "connected"
      ? "bg-green"
      : connectionStatus === "reconnecting"
        ? "bg-amber motion-safe:animate-pulse"
        : "bg-red";

  const textClass =
    connectionStatus === "connected"
      ? "text-green"
      : connectionStatus === "reconnecting"
        ? "text-amber"
        : "text-red";

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-border-subtle bg-mol-primary px-4 font-mono text-[10px] text-txt-muted">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div
            aria-hidden
            className={cn("h-1.5 w-1.5 rounded-full", dotClass)}
          />
          <span className={textClass}>{connectionStatus}</span>
          {mock && <span className="text-amber">· mock</span>}
        </div>

        <span>Deep Robotics Lite3</span>
        <span>ROS 2 Humble · Jetson Orin NX</span>
        <span>{site ? `site ${site}` : "no site"}</span>
      </div>

      <div className="flex items-center gap-4">
        <span>CPU: {pct(health?.cpuPercent)}</span>
        <span>GPU: {pct(health?.gpuPercent)}</span>
        <span>
          RAM:{" "}
          {health?.memoryUsedGb !== null && health?.memoryUsedGb !== undefined
            ? `${health.memoryUsedGb}/${health.memoryTotalGb ?? "?"} GB`
            : "—"}
        </span>
        <span>
          Temp:{" "}
          {health?.cpuTempC !== null && health?.cpuTempC !== undefined
            ? `${health.cpuTempC}°C`
            : "—"}
        </span>
      </div>
    </footer>
  );
}
