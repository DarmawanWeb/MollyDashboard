import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/* ----------------------------------------------------------------------------
 * Schema
 * ------------------------------------------------------------------------- */

export type LlmProvider = "anthropic" | "openai" | "gemini" | "local";

export type Nav2Planner = "NavFn" | "Smac2d" | "SmacHybrid" | "ThetaStar";
export type Nav2Controller = "DWB" | "RPP" | "Graceful";

export interface Nav2Params {
  maxVelLin: number;
  maxVelAng: number;
  minObstacleDist: number;
  goalTolerance: number;
  planner: Nav2Planner;
  controller: Nav2Controller;
}

export interface StreamConfig {
  resolution: string;
  fps: number;
}

export interface ConnectionConfig {
  rosbridgeUrl: string;
  videoServerUrl: string;
}

export interface TeleopConfig {
  linearVel: number;
  angularVel: number;
}

export interface LlmConfig {
  provider: LlmProvider;
  apiKey: string;
  model: string;
}

interface SettingsState {
  connection: ConnectionConfig;
  stream: StreamConfig;
  teleop: TeleopConfig;
  nav2: Nav2Params;
  llm: LlmConfig;

  setConnection: (patch: Partial<ConnectionConfig>) => void;
  setStream: (patch: Partial<StreamConfig>) => void;
  setTeleop: (patch: Partial<TeleopConfig>) => void;
  setNav2: (patch: Partial<Nav2Params>) => void;
  setLlm: (patch: Partial<LlmConfig>) => void;
  reset: () => void;
}

/* ----------------------------------------------------------------------------
 * Defaults
 * ------------------------------------------------------------------------- */

const DEFAULTS = {
  connection: {
    rosbridgeUrl: "ws://192.168.1.120:9090",
    videoServerUrl: "http://192.168.1.120:8080",
  },
  stream: {
    resolution: "640x480",
    fps: 30,
  },
  teleop: {
    linearVel: 0.3,
    angularVel: 0.5,
  },
  nav2: {
    maxVelLin: 0.5,
    maxVelAng: 1.0,
    minObstacleDist: 0.25,
    goalTolerance: 0.1,
    planner: "NavFn" as Nav2Planner,
    controller: "DWB" as Nav2Controller,
  },
  llm: {
    provider: "anthropic" as LlmProvider,
    apiKey: "",
    model: "claude-sonnet-4-20250514",
  },
} as const;

/* ----------------------------------------------------------------------------
 * Store
 * ------------------------------------------------------------------------- */

/**
 * User-configurable dashboard settings, persisted to localStorage.
 *
 * Why persisted: operators don't want to retype rosbridge URL or LLM key
 * every page refresh. Note that storing api keys in localStorage is
 * tradition over hygiene — fine for an internal robotics dashboard, not
 * for a public product.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      setConnection: (patch) =>
        set((s) => ({ connection: { ...s.connection, ...patch } })),
      setStream: (patch) => set((s) => ({ stream: { ...s.stream, ...patch } })),
      setTeleop: (patch) => set((s) => ({ teleop: { ...s.teleop, ...patch } })),
      setNav2: (patch) => set((s) => ({ nav2: { ...s.nav2, ...patch } })),
      setLlm: (patch) => set((s) => ({ llm: { ...s.llm, ...patch } })),

      reset: () => set(DEFAULTS),
    }),
    {
      name: "molly-settings",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
