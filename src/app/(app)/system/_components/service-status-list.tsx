"use client";

import { Activity, RefreshCw, Server } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { MollyButton } from "@/components/ui/molly";
import { useRobotApi } from "@/hooks/use-robot-api";
import { cn } from "@/lib/utils";
import { useRobotStore } from "@/stores/use-robot-store";
import { useSystemStore } from "@/stores/use-system-store";
import type { HealthLevel } from "@/types";

const LEVEL_STYLE: Record<HealthLevel, { dot: string; text: string }> = {
  ok: { dot: "bg-green", text: "text-green" },
  warn: { dot: "bg-amber", text: "text-amber" },
  error: { dot: "bg-red", text: "text-red" },
  unknown: { dot: "bg-txt-muted", text: "text-txt-muted" },
};

/**
 * Health issues and topic rates (/health/status), plus the running ROS
 * nodes (rosapi).
 */
export default function ServiceStatusList() {
  const api = useRobotApi();
  const health = useSystemStore((s) => s.health);
  const epoch = useRobotStore((s) => s.rosEpoch);
  const [nodes, setNodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setNodes(await api.listNodes());
    setLoading(false);
  }, [api]);

  useEffect(() => {
    void epoch;
    void refresh();
  }, [refresh, epoch]);

  const level = LEVEL_STYLE[health?.level ?? "unknown"];
  const topics = Object.entries(health?.topics ?? {});

  return (
    <div className="p-3 flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Activity size={14} />
          <span className="label text-xs">Health</span>
          <div className="flex-1" />
          <div className={cn("w-2 h-2", level.dot)} />
          <span className={cn("font-mono text-[10px] uppercase", level.text)}>
            {health?.level ?? "unknown"}
          </span>
        </div>
        {health && health.issues.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {health.issues.map((issue) => (
              <li
                key={issue}
                className="panel-inset px-2.5 py-1.5 text-[11px] font-mono text-amber"
              >
                {issue}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-[11px] text-txt-muted">
            {health ? "No issues." : "Waiting for /health/status…"}
          </div>
        )}
      </div>

      {topics.length > 0 && (
        <div>
          <span className="label">Topic rates</span>
          <div className="flex flex-col gap-0.5 mt-1.5">
            {topics.map(([name, hz]) => (
              <div
                key={name}
                className="flex items-center justify-between font-mono text-[11px]"
              >
                <span className="text-txt-secondary truncate">{name}</span>
                <span className={hz > 0 ? "text-txt-primary" : "text-red"}>
                  {hz.toFixed(1)} Hz
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Server size={14} />
          <span className="label text-xs">Nodes ({nodes.length})</span>
          <div className="flex-1" />
          <MollyButton
            variant="ghost"
            size="xs"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh nodes"
          >
            <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
          </MollyButton>
        </div>
        <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
          {nodes.length === 0 && (
            <div className="text-[11px] text-txt-muted">
              No nodes (rosapi not reachable).
            </div>
          )}
          {nodes.map((node) => (
            <div
              key={node}
              className="font-mono text-[11px] text-txt-secondary px-2 py-0.5 border-l-2 border-green/40"
            >
              {node}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
