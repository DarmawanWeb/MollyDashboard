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
  /** robot color at zero alpha, where the glow fades out */
  robotClear: string;
  trail: string;
  poi: string;
  poiHalo: string;
  poiActive: string;
  /** outline of the POI markers, against the floor */
  poiStroke: string;
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

/*
 * A plain floor plan: neutral floor and walls, the accent for Molly and her
 * path, gray stops (the active one in the accent), orange visitors.
 */

/** Dark floor, light gray walls. */
const DARK: CanvasPalette = {
  bg: "#111215",
  gridLine: "rgba(255,255,255,0.025)",
  gridLineMajor: "rgba(255,255,255,0.05)",
  unknown: [17, 18, 21],
  free: [28, 29, 34],
  occupied: [150, 153, 163],
  robot: "#6e74f7",
  robotGlow: "rgba(110,116,247,0.38)",
  robotClear: "rgba(110,116,247,0)",
  trail: "rgba(110,116,247,0.55)",
  poi: "#c9cbd2",
  poiHalo: "rgba(255,255,255,0.14)",
  poiActive: "#6e74f7",
  poiStroke: "rgba(12,13,16,0.9)",
  path: "rgba(110,116,247,0.85)",
  goal: "#fbbf24",
  route: "rgba(201,203,210,0.45)",
  routeReturn: "rgba(201,203,210,0.25)",
  routeNumber: "#0c0d10",
  visitor: "#fb923c",
  visitorHalo: "rgba(251,146,60,0.22)",
  placement: "#34d399",
  text: "#f1f2f4",
  textMuted: "rgba(241,242,244,0.55)",
  overlay: "rgba(20,21,25,0.94)",
  overlayBorder: "rgba(255,255,255,0.08)",
};

/** White floor, dark gray walls. */
const LIGHT: CanvasPalette = {
  bg: "#f1f2f5",
  gridLine: "rgba(17,19,24,0.035)",
  gridLineMajor: "rgba(17,19,24,0.06)",
  unknown: [241, 242, 245],
  free: [255, 255, 255],
  occupied: [74, 78, 89],
  robot: "#4f46e5",
  robotGlow: "rgba(79,70,229,0.28)",
  robotClear: "rgba(79,70,229,0)",
  trail: "rgba(79,70,229,0.5)",
  poi: "#4a4e59",
  poiHalo: "rgba(17,19,24,0.1)",
  poiActive: "#4f46e5",
  poiStroke: "rgba(255,255,255,0.95)",
  path: "rgba(79,70,229,0.8)",
  goal: "#d97706",
  route: "rgba(74,78,89,0.4)",
  routeReturn: "rgba(74,78,89,0.22)",
  routeNumber: "#ffffff",
  visitor: "#ea580c",
  visitorHalo: "rgba(234,88,12,0.16)",
  placement: "#16a34a",
  text: "#111318",
  textMuted: "rgba(17,19,24,0.55)",
  overlay: "rgba(255,255,255,0.95)",
  overlayBorder: "rgba(17,19,24,0.1)",
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
