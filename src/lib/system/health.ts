/**
 * Parse the molly_health JSON summary on /health/status.
 */

import type { HealthLevel, HealthSnapshot } from "@/types/ui";

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

function level(value: unknown): HealthLevel {
  return value === "ok" || value === "warn" || value === "error"
    ? value
    : "unknown";
}

export function parseHealth(raw: string): HealthSnapshot | null {
  let o: Record<string, unknown>;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    o = value as Record<string, unknown>;
  } catch {
    return null;
  }

  const topics: Record<string, number> = {};
  if (typeof o.topics === "object" && o.topics !== null) {
    for (const [name, hz] of Object.entries(o.topics)) {
      const n = num(hz);
      if (n !== null) topics[name] = n;
    }
  }

  return {
    ok: o.ok === true,
    level: level(o.level),
    issues: Array.isArray(o.issues)
      ? o.issues.filter((i): i is string => typeof i === "string")
      : [],
    topics,
    odometry: str(o.odometry),
    localization: str(o.localization),
    field: str(o.field),
    estop: o.estop === true,
    cpuTempC: num(o.cpu_temp_c),
    cpuPercent: num(o.cpu_percent),
    gpuPercent: num(o.gpu_percent),
    memoryPercent: num(o.memory_percent),
    memoryUsedGb: num(o.memory_used_gb),
    memoryTotalGb: num(o.memory_total_gb),
    diskFreeGb: num(o.disk_free_gb),
    load: num(o.load),
  };
}
