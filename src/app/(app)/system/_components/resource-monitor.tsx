"use client";

import { Cpu, HardDrive, Thermometer } from "lucide-react";
import { useSystemStore } from "@/stores/use-system-store";
import ResourceBar from "./resource-bar";

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Robot computer load from /health/status (molly_health).
 */
export default function ResourceMonitor() {
  const health = useSystemStore((s) => s.health);

  return (
    <div className="p-3 border-b border-border-subtle">
      <div className="flex items-center gap-2 mb-3">
        <Cpu size={14} />
        <span className="label text-xs">Resource Monitor</span>
      </div>

      {!health ? (
        <div className="text-xs text-txt-muted py-2">
          Waiting for /health/status…
        </div>
      ) : (
        <>
          <ResourceBar
            label="CPU"
            value={round1(health.cpuPercent ?? 0)}
            max={100}
            unit="%"
            color="#22d3ee"
          />
          {health.gpuPercent !== null && (
            <ResourceBar
              label="GPU"
              value={round1(health.gpuPercent)}
              max={100}
              unit="%"
              color="#8b5cf6"
            />
          )}
          <ResourceBar
            label="RAM"
            value={round1(health.memoryUsedGb ?? 0)}
            max={round1(health.memoryTotalGb ?? 0) || 1}
            unit=" GB"
            color="#f59e0b"
          />

          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <div className="panel-inset px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Thermometer size={11} />
                <span className="label">Hottest zone</span>
              </div>
              <span
                className={
                  (health.cpuTempC ?? 0) > 70
                    ? "text-red"
                    : "text-txt-secondary"
                }
              >
                {health.cpuTempC === null ? "—" : `${health.cpuTempC}°C`}
              </span>
            </div>

            <div className="panel-inset px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <HardDrive size={11} />
                <span className="label">Disk free</span>
              </div>
              <span className="text-txt-secondary">
                {health.diskFreeGb === null ? "—" : `${health.diskFreeGb} GB`}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
