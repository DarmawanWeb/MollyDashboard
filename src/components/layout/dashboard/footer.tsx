"use client";

import { formatUptime, useTicker } from "@/hooks/use-ros";
import { cn } from "@/lib/utils";
import { useRobotStore } from "@/stores/use-robot-store";

export function Footer() {
  const robotState = useRobotStore((state) => state.state);
  const connectionStatus = useRobotStore((state) => state.connectionStatus);

  const uptime = useTicker(true, robotState.uptime_seconds);

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
        </div>

        <span>ROS 2 Humble</span>
        <span>Jetson Orin NX</span>
      </div>

      <div className="flex items-center gap-4">
        <span>Uptime: {formatUptime(uptime)}</span>
        <span>CPU: {robotState.cpu_usage}%</span>
        <span>GPU: {robotState.gpu_usage}%</span>
        <span>
          RAM: {robotState.ram_used_gb}/{robotState.ram_total_gb} GB
        </span>
      </div>
    </footer>
  );
}
