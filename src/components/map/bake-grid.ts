/**
 * Pre-render an OccupancyGrid to an offscreen canvas as an image.
 *
 * Why bake: the main render loop runs at 60fps, but the grid only changes
 * when /map updates (typically <1Hz). Per-pixel iteration over a 1000x1000
 * grid every frame would tank performance. Baking once means the hot path
 * is just a single drawImage call.
 *
 * The output is a canvas matching the grid's natural pixel dimensions —
 * the rendering scale/transform is applied at draw time, not bake time.
 */

import type { OccupancyGrid } from "@/types/ros";
import { PALETTE } from "./palette";

/**
 * Returns null in non-browser environments (SSR safety).
 */
export function bakeGrid(grid: OccupancyGrid): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;

  const { width: W, height: H } = grid.info;
  const off = document.createElement("canvas");
  off.width = W;
  off.height = H;

  const ctx = off.getContext("2d");
  if (!ctx) return off;

  const img = ctx.createImageData(W, H);
  const { data } = grid;

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    const [r, g, b, a] = cellColor(v);
    const o = i * 4;
    img.data[o] = r;
    img.data[o + 1] = g;
    img.data[o + 2] = b;
    img.data[o + 3] = a;
  }

  ctx.putImageData(img, 0, 0);
  return off;
}

/**
 * Map an occupancy value (-1 unknown, 0..100 probability) to an RGBA tuple.
 */
function cellColor(v: number): [number, number, number, number] {
  if (v < 0) {
    // unknown — slightly transparent so grid lines show through
    const [r, g, b] = PALETTE.unknown;
    return [r, g, b, 180];
  }
  if (v < 25) {
    const [r, g, b] = PALETTE.free;
    return [r, g, b, 255];
  }
  if (v < 65) {
    // soft gradient between free and occupied
    const t = (v - 25) / 40;
    const r = Math.round(PALETTE.free[0] * (1 - t) + PALETTE.occupied[0] * t);
    const g = Math.round(PALETTE.free[1] * (1 - t) + PALETTE.occupied[1] * t);
    const b = Math.round(PALETTE.free[2] * (1 - t) + PALETTE.occupied[2] * t);
    return [r, g, b, 255];
  }
  const [r, g, b] = PALETTE.occupied;
  return [r, g, b, 255];
}
