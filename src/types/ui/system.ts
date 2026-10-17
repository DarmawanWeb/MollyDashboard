/**
 * System health and log types.
 */

export type HealthLevel = "ok" | "warn" | "error" | "unknown";

/** Parsed /health/status (molly_health). */
export interface HealthSnapshot {
  ok: boolean;
  level: HealthLevel;
  issues: string[];
  /** Measured rate per watched topic (Hz) */
  topics: Record<string, number>;
  odometry: string | null;
  localization: string | null;
  field: string | null;
  estop: boolean;
  cpuTempC: number | null;
  cpuPercent: number | null;
  gpuPercent: number | null;
  memoryPercent: number | null;
  memoryUsedGb: number | null;
  memoryTotalGb: number | null;
  diskFreeGb: number | null;
  load: number | null;
}

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogEntry {
  id: number;
  /** HH:MM:SS local time */
  timestamp: string;
  level: LogLevel;
  node: string;
  message: string;
}
