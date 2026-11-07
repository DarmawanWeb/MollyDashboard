"use client";

import { HardDrive, Thermometer } from "lucide-react";
import { useSystemStore } from "@/stores/use-system-store";
import ResourceBar from "./resource-bar";

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Robot computer load from /health/status (molly_health).
 */
export default function ResourceMonitor() {
  const health = useSystemStore((s) => s.health);

  return (
    <div>
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
          />
          {health.gpuPercent !== null && (
            <ResourceBar
              label="GPU"
              value={round1(health.gpuPercent)}
              max={100}
              unit="%"
            />
          )}
          <ResourceBar
            label="RAM"
            value={round1(health.memoryUsedGb ?? 0)}
            max={round1(health.memoryTotalGb ?? 0) || 1}
            unit=" GB"
          />

          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <div className="panel-inset px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1 text-txt-tertiary">
                <Thermometer size={12} />
                <span className="label">Hottest zone</span>
              </div>
              <span
                className={
                  (health.cpuTempC ?? 0) > 70
                    ? "text-sm font-semibold text-red"
                    : "text-sm font-semibold text-txt-primary"
                }
              >
                {health.cpuTempC === null ? "—" : `${health.cpuTempC}°C`}
              </span>
            </div>

            <div className="panel-inset px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1 text-txt-tertiary">
                <HardDrive size={12} />
                <span className="label">Disk free</span>
              </div>
              <span className="text-sm font-semibold text-txt-primary">
                {health.diskFreeGb === null ? "—" : `${health.diskFreeGb} GB`}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
