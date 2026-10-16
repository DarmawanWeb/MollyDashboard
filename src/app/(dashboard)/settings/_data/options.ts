/**
 * Dropdown option lists for the Settings page.
 *
 * Kept separate from components so they're easy to grep, edit, and reuse
 * across sections (e.g. Stream resolution shared with a future Camera page).
 */

import type { MollySelectOption } from "@/components/ui/molly";
import type {
  LlmProvider,
  Nav2Controller,
  Nav2Planner,
} from "@/stores/use-settings-store";

export const STREAM_RESOLUTION_OPTIONS: ReadonlyArray<MollySelectOption> = [
  { value: "320x240", label: "320 × 240" },
  { value: "640x480", label: "640 × 480" },
  { value: "1280x720", label: "1280 × 720" },
];

export const STREAM_FPS_OPTIONS: ReadonlyArray<MollySelectOption> = [
  { value: "10", label: "10 fps" },
  { value: "15", label: "15 fps" },
  { value: "30", label: "30 fps" },
];

export const NAV2_PLANNER_OPTIONS: ReadonlyArray<
  MollySelectOption<Nav2Planner>
> = [
  { value: "NavFn", label: "NavFn (Dijkstra)" },
  { value: "Smac2d", label: "Smac 2D" },
  { value: "SmacHybrid", label: "Smac Hybrid-A*" },
  { value: "ThetaStar", label: "Theta*" },
];

export const NAV2_CONTROLLER_OPTIONS: ReadonlyArray<
  MollySelectOption<Nav2Controller>
> = [
  { value: "DWB", label: "DWB (Dynamic Window)" },
  { value: "RPP", label: "Regulated Pure Pursuit" },
  { value: "Graceful", label: "Graceful Motion" },
];

export const LLM_PROVIDER_OPTIONS: ReadonlyArray<
  MollySelectOption<LlmProvider>
> = [
  { value: "anthropic", label: "Anthropic Claude" },
  { value: "openai", label: "OpenAI GPT-4" },
  { value: "gemini", label: "Google Gemini" },
  { value: "local", label: "Local (Ollama)" },
];

export const MOTION_ACTIONS = ["wave", "bow", "sit", "stand", "dance"] as const;
