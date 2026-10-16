import type { OccupancyGrid } from "@/types/ros";
import { PALETTE } from "../palette";
import {
  pixelsPerMeter,
  project,
  unproject,
  type Viewport,
} from "../projection";

/**
 * Draws 1m minor + 5m major grid lines aligned to world coordinates.
 *
 * Skipped when zoomed out far enough that grid lines would clutter or moiré.
 * Major lines (every 5m) use the cyan-tinted color from PALETTE to give a
 * subtle visual reference point.
 */
export function drawGridLines(
  ctx: CanvasRenderingContext2D,
  grid: OccupancyGrid,
  view: Viewport,
  cW: number,
  cH: number,
): void {
  const oneMeter = pixelsPerMeter(grid, view, cW, cH);
  if (oneMeter < 14) return; // too dense — would just look like noise

  // find world-aligned grid lines that fall within the canvas viewport
  const { wx: cwx, wy: cwy } = unproject(cW / 2, cH / 2, grid, view, cW, cH);
  const startWX = Math.floor(cwx - cW / oneMeter / 2) - 1;
  const endWX = Math.ceil(cwx + cW / oneMeter / 2) + 1;
  const startWY = Math.floor(cwy - cH / oneMeter / 2) - 1;
  const endWY = Math.ceil(cwy + cH / oneMeter / 2) + 1;

  ctx.lineWidth = 1;

  // verticals
  for (let wx = startWX; wx <= endWX; wx++) {
    const [px] = project(wx, 0, grid, view, cW, cH);
    if (px < -2 || px > cW + 2) continue;
    ctx.strokeStyle = wx % 5 === 0 ? PALETTE.gridLineMajor : PALETTE.gridLine;
    ctx.beginPath();
    ctx.moveTo(px + 0.5, 0);
    ctx.lineTo(px + 0.5, cH);
    ctx.stroke();
  }

  // horizontals
  for (let wy = startWY; wy <= endWY; wy++) {
    const [, py] = project(0, wy, grid, view, cW, cH);
    if (py < -2 || py > cH + 2) continue;
    ctx.strokeStyle = wy % 5 === 0 ? PALETTE.gridLineMajor : PALETTE.gridLine;
    ctx.beginPath();
    ctx.moveTo(0, py + 0.5);
    ctx.lineTo(cW, py + 0.5);
    ctx.stroke();
  }
}
