import type { OccupancyGrid } from "@/types/ros";
import { PALETTE } from "../palette";
import { project, type Viewport } from "../projection";

/**
 * Visitors around the robot (map frame), as small halos whose opacity
 * follows the detection confidence.
 */
export function drawVisitors(
  ctx: CanvasRenderingContext2D,
  visitors: ReadonlyArray<{ x: number; y: number; confidence: number }>,
  grid: OccupancyGrid,
  view: Viewport,
  cW: number,
  cH: number,
): void {
  for (const v of visitors) {
    const [px, py] = project(v.x, v.y, grid, view, cW, cH);
    ctx.globalAlpha = 0.4 + 0.6 * Math.min(1, Math.max(0, v.confidence));
    ctx.fillStyle = PALETTE.visitorHalo;
    ctx.beginPath();
    ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.visitor;
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
