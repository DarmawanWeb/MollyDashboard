/**
 * Canvas colors used by the map renderers, one set per theme.
 *
 * The canvas 2D context needs raw color strings (no CSS custom properties),
 * so the tokens of globals.css are mirrored here by hand. The renderers read
 * the live `PALETTE`; ThemeProvider swaps its values when the theme
 * changes, and the next animation frame draws with them. The baked occupancy
 * image takes its palette explicitly (`canvasPalette(theme)`), because it is
 * cached between frames.
 */

import type { ResolvedTheme } from "@/types/ui";

type Rgb = readonly [number, number, number];

export interface CanvasPalette {
  bg: string;
  gridLine: string;
  gridLineMajor: string;
  /** occupancy cells */
  unknown: Rgb;
  free: Rgb;
  occupied: Rgb;
  robot: string;
  robotGlow: string;
  trail: string;
  poi: string;
  poiHalo: string;
  poiActive: string;
  path: string;
  goal: string;
  route: string;
  routeReturn: string;
  routeNumber: string;
  visitor: string;
  visitorHalo: string;
  placement: string;
  text: string;
  textMuted: string;
  overlay: string;
  overlayBorder: string;
}

/** Blueprint look: dark floor, light walls. */
const DARK: CanvasPalette = {
  bg: "#0c1322",
  gridLine: "rgba(148,163,196,0.05)",
  gridLineMajor: "rgba(34,211,238,0.08)",
  unknown: [12, 19, 34],
  free: [24, 34, 56],
  occupied: [156, 174, 210],
  robot: "#22d3ee",
  robotGlow: "rgba(34,211,238,0.45)",
  trail: "rgba(34,211,238,0.55)",
  poi: "#a78bfa",
  poiHalo: "rgba(167,139,250,0.3)",
  poiActive: "#22d3ee",
  path: "rgba(34,211,238,0.85)",
  goal: "#fbbf24",
  route: "rgba(167,139,250,0.75)",
  routeReturn: "rgba(167,139,250,0.45)",
  routeNumber: "#ffffff",
  visitor: "#fb923c",
  visitorHalo: "rgba(251,146,60,0.25)",
  placement: "#34d399",
  text: "#d9e2f2",
  textMuted: "rgba(217,226,242,0.6)",
  overlay: "rgba(9,14,26,0.82)",
  overlayBorder: "rgba(255,255,255,0.08)",
};

/** Floor plan look: white floor, slate walls. */
const LIGHT: CanvasPalette = {
  bg: "#eef2f8",
  gridLine: "rgba(15,23,42,0.04)",
  gridLineMajor: "rgba(8,145,178,0.1)",
  unknown: [226, 231, 240],
  free: [255, 255, 255],
  occupied: [51, 65, 85],
  robot: "#0891b2",
  robotGlow: "rgba(8,145,178,0.35)",
  trail: "rgba(8,145,178,0.5)",
  poi: "#7c3aed",
  poiHalo: "rgba(124,58,237,0.22)",
  poiActive: "#0891b2",
  path: "rgba(8,145,178,0.85)",
  goal: "#d97706",
  route: "rgba(124,58,237,0.7)",
  routeReturn: "rgba(124,58,237,0.4)",
  routeNumber: "#ffffff",
  visitor: "#ea580c",
  visitorHalo: "rgba(234,88,12,0.18)",
  placement: "#059669",
  text: "#1e293b",
  textMuted: "rgba(30,41,59,0.6)",
  overlay: "rgba(255,255,255,0.92)",
  overlayBorder: "rgba(15,23,42,0.1)",
};

/** Colors for the given theme (pure; use for cached drawings). */
export function canvasPalette(theme: ResolvedTheme): CanvasPalette {
  return theme === "light" ? LIGHT : DARK;
}

/** The palette the renderers draw with; follows the current theme. */
export const PALETTE: CanvasPalette = { ...DARK };

/** Point the renderers at the given theme's colors. */
export function setCanvasTheme(theme: ResolvedTheme): void {
  Object.assign(PALETTE, canvasPalette(theme));
}

/** Canvas font shorthand in the dashboard's families. */
export function canvasFont(
  px: number,
  weight = 400,
  family: "mono" | "sans" = "mono",
): string {
  const stack =
    family === "sans"
      ? "'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, sans-serif"
      : "'JetBrains Mono Variable', 'JetBrains Mono', monospace";
  return `${weight} ${px}px ${stack}`;
}
