/* ----------------------------------------------------------------------------
 * Schema
 * ------------------------------------------------------------------------- */

export interface Env {
  /** rosbridge_suite WebSocket endpoint */
  readonly ROSBRIDGE_URL: string;
  /** web_video_server HTTP base */
  readonly VIDEO_SERVER_URL: string;
  /** Substitute mock data for ROS topics when true. Useful for dev offline. */
  readonly USE_MOCKS: boolean;
  /** Build-time NODE_ENV mirror — derived, not read from public env */
  readonly IS_PRODUCTION: boolean;
  readonly IS_DEVELOPMENT: boolean;
}

/* ----------------------------------------------------------------------------
 * Validators
 * ------------------------------------------------------------------------- */

function requireWebSocketUrl(name: string, raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (!value) {
    throw new EnvError(`${name} is required`);
  }
  if (!/^wss?:\/\//.test(value)) {
    throw new EnvError(
      `${name} must start with ws:// or wss://, got "${value}"`,
    );
  }
  // surface obvious typos early
  try {
    new URL(value);
  } catch {
    throw new EnvError(`${name} is not a valid URL: "${value}"`);
  }
  return value;
}

function requireHttpUrl(name: string, raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (!value) {
    throw new EnvError(`${name} is required`);
  }
  if (!/^https?:\/\//.test(value)) {
    throw new EnvError(
      `${name} must start with http:// or https://, got "${value}"`,
    );
  }
  try {
    new URL(value);
  } catch {
    throw new EnvError(`${name} is not a valid URL: "${value}"`);
  }
  return value;
}

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) return fallback;
  const v = raw.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no" || v === "") return false;
  return fallback;
}

class EnvError extends Error {
  constructor(message: string) {
    super(`[env] ${message}`);
    this.name = "EnvError";
  }
}

/* ----------------------------------------------------------------------------
 * Read + validate
 *
 * NOTE: process.env access must use literal string keys for Next.js to inline
 * NEXT_PUBLIC_* values at build time. Don't refactor these to dynamic lookups.
 * ------------------------------------------------------------------------- */

function readEnv(): Env {
  const nodeEnv = process.env.NODE_ENV ?? "development";

  return {
    ROSBRIDGE_URL: requireWebSocketUrl(
      "NEXT_PUBLIC_ROSBRIDGE_URL",
      process.env.NEXT_PUBLIC_ROSBRIDGE_URL ?? "ws://localhost:9090",
    ),
    VIDEO_SERVER_URL: requireHttpUrl(
      "NEXT_PUBLIC_VIDEO_SERVER_URL",
      process.env.NEXT_PUBLIC_VIDEO_SERVER_URL ?? "http://localhost:8080",
    ),
    USE_MOCKS: parseBool(
      process.env.NEXT_PUBLIC_USE_MOCKS,
      nodeEnv !== "production",
    ),
    IS_PRODUCTION: nodeEnv === "production",
    IS_DEVELOPMENT: nodeEnv !== "production",
  };
}

/**
 * Validated env, frozen so consumers can't accidentally mutate.
 *
 * Module-level evaluation means misconfiguration crashes the app at startup
 * (visible in logs / build) rather than at the first ROS subscribe call.
 */
export const env: Env = Object.freeze(readEnv());
