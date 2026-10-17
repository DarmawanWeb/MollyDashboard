import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Language } from "@/types";

/* ----------------------------------------------------------------------------
 * Schema
 * ------------------------------------------------------------------------- */

export interface ConnectionConfig {
  /** rosbridge WebSocket URL; empty: NEXT_PUBLIC_ROSBRIDGE_URL */
  rosbridgeUrl: string;
  /** web_video_server base URL; empty: NEXT_PUBLIC_VIDEO_SERVER_URL */
  videoServerUrl: string;
  /** Namespace of the robot driver topics and services */
  robotNamespace: string;
}

export interface VideoConfig {
  /** JPEG quality 1..100 */
  quality: number;
  /** Frame width in pixels */
  width: number;
}

export interface TeleopConfig {
  /** m/s forward / backward */
  linearVel: number;
  /** m/s sideways */
  lateralVel: number;
  /** rad/s */
  angularVel: number;
}

export interface InteractionConfig {
  /** Default speech / conversation language */
  language: Language;
  /** One-tap phrases on the interaction panel */
  quickPhrases: string[];
}

interface SettingsState {
  connection: ConnectionConfig;
  video: VideoConfig;
  teleop: TeleopConfig;
  interaction: InteractionConfig;

  setConnection: (patch: Partial<ConnectionConfig>) => void;
  setVideo: (patch: Partial<VideoConfig>) => void;
  setTeleop: (patch: Partial<TeleopConfig>) => void;
  setInteraction: (patch: Partial<InteractionConfig>) => void;
  reset: () => void;
}

/* ----------------------------------------------------------------------------
 * Defaults
 * ------------------------------------------------------------------------- */

const DEFAULTS = {
  connection: {
    rosbridgeUrl: "",
    videoServerUrl: "",
    robotNamespace: "robot",
  },
  video: {
    quality: 60,
    width: 960,
  },
  teleop: {
    linearVel: 0.3,
    lateralVel: 0.2,
    angularVel: 0.6,
  },
  interaction: {
    language: "id" as Language,
    quickPhrases: [
      "Selamat datang! Saya Molly, pemandu Anda hari ini.",
      "Silakan ikuti saya.",
      "Mohon beri jalan, terima kasih.",
      "Terima kasih atas kunjungan Anda!",
      "Welcome! I am Molly, your guide today.",
    ],
  },
} as const satisfies Pick<
  SettingsState,
  "connection" | "video" | "teleop" | "interaction"
>;

type PersistedSettings = Pick<
  SettingsState,
  "connection" | "video" | "teleop" | "interaction"
>;

/** Bring settings saved by an older dashboard version to the current schema. */
function migrate(persisted: unknown, version: number): PersistedSettings {
  const base: PersistedSettings = structuredClone(DEFAULTS);
  if (version >= 2 || typeof persisted !== "object" || persisted === null) {
    return { ...base, ...(persisted as Partial<PersistedSettings>) };
  }
  // v1 kept connection URLs (with a hard-coded default robot address), stream,
  // teleop, nav2 and LLM sections; only the URLs the operator typed survive.
  const v1 = persisted as { connection?: Partial<ConnectionConfig> };
  return {
    ...base,
    connection: {
      ...base.connection,
      rosbridgeUrl: v1.connection?.rosbridgeUrl ?? "",
      videoServerUrl: v1.connection?.videoServerUrl ?? "",
    },
  };
}

/* ----------------------------------------------------------------------------
 * Store
 * ------------------------------------------------------------------------- */

/**
 * User-configurable dashboard settings, persisted to localStorage.
 *
 * Empty connection URLs fall back to the NEXT_PUBLIC_* defaults at the
 * point of use (ConnectionProvider, camera feed), so a build configured for
 * one robot keeps working until the operator overrides it.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...structuredClone(DEFAULTS),

      setConnection: (patch) =>
        set((s) => ({ connection: { ...s.connection, ...patch } })),
      setVideo: (patch) => set((s) => ({ video: { ...s.video, ...patch } })),
      setTeleop: (patch) => set((s) => ({ teleop: { ...s.teleop, ...patch } })),
      setInteraction: (patch) =>
        set((s) => ({ interaction: { ...s.interaction, ...patch } })),

      reset: () => set(structuredClone(DEFAULTS)),
    }),
    {
      name: "molly-settings",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate,
      partialize: (s): PersistedSettings => ({
        connection: s.connection,
        video: s.video,
        teleop: s.teleop,
        interaction: s.interaction,
      }),
    },
  ),
);
