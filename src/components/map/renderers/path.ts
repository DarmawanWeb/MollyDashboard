import type { OccupancyGrid } from "@/types/ros";
import type { PathPoint } from "@/types/ui";
import { PALETTE } from "../palette";
import { project, type Viewport } from "../projection";

/**
 * The planned path (planner/path) as a dashed polyline.
 */
export function drawPath(
  ctx: CanvasRenderingContext2D,
  path: ReadonlyArray<PathPoint>,
  grid: OccupancyGrid,
  view: Viewport,
  cW: number,
  cH: number,
): void {
  if (path.length < 2) return;
  ctx.save();
  ctx.strokeStyle = PALETTE.path;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  path.forEach((p, i) => {
    const [px, py] = project(p.x, p.y, grid, view, cW, cH);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
  ctx.restore();
}

/**
 * The goal the robot walks to: a ring with the arrival heading.
 */
export function drawGoal(
  ctx: CanvasRenderingContext2D,
  goal: { x: number; y: number; yaw: number },
  grid: OccupancyGrid,
  view: Viewport,
  cW: number,
  cH: number,
): void {
  const [px, py] = project(goal.x, goal.y, grid, view, cW, cH);
  ctx.save();
  ctx.strokeStyle = PALETTE.goal;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, py, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + Math.cos(goal.yaw) * 16, py - Math.sin(goal.yaw) * 16);
  ctx.stroke();
  ctx.restore();
}
