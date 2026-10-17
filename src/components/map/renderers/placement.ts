import type { OccupancyGrid } from "@/types/ros";
import { PALETTE } from "../palette";
import { project, type Viewport } from "../projection";
import { drawHeading } from "./poi";

/**
 * Preview of a POI being placed: where it goes and the heading dragged out.
 */
export function drawPlacement(
  ctx: CanvasRenderingContext2D,
  pose: { x: number; y: number; yaw: number },
  grid: OccupancyGrid,
  view: Viewport,
  cW: number,
  cH: number,
): void {
  const [px, py] = project(pose.x, pose.y, grid, view, cW, cH);
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = PALETTE.placement;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(px, py, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  drawHeading(ctx, px, py, pose.yaw, PALETTE.placement, 22);
}
