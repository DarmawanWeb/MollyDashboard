/**
 * Canvas color constants used by the map renderers.
 *
 * These are kept separate from the design tokens in globals.css because canvas
 * 2D context needs raw color strings — there's no way to pass CSS custom
 * properties to ctx.fillStyle. We mirror the Molly palette by hand.
 *
 * If you change a Molly token in globals.css, sync the corresponding value
 * here too. Future cleanup: read from getComputedStyle() at module load.
 */

export const PALETTE = {
  // surfaces
  bg: "#0a0a0a",

  // grid
  gridLine: "rgba(255,255,255,0.025)",
  gridLineMajor: "rgba(34,211,238,0.06)",

  // cells
  unknown: [70, 70, 75] as const,
  free: [232, 234, 237] as const,
  occupied: [12, 14, 18] as const,

  // robot
  robot: "#22d3ee",
  robotGlow: "rgba(34,211,238,0.45)",

  // trail
  trail: "rgba(34,211,238,0.55)",

  // POIs
  poi: "#a855f7",
  poiActive: "#22d3ee",

  // text
  text: "#d4d4d8",
  textMuted: "rgba(212,212,216,0.6)",

  // overlay panels (scale bar, tooltip, compass)
  overlay: "rgba(10,10,10,0.78)",
  overlayBorder: "rgba(255,255,255,0.08)",
} as const;

export type CanvasPalette = typeof PALETTE;
