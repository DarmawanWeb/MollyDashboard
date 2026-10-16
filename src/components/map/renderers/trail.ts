import type { OccupancyGrid } from "@/types/ros";
import { project, type Viewport } from "../projection";

/**
 * Draws the robot's recent path as a fading polyline.
 *
 * Trail points are in world coords (meters). The most recent point is fully
 * opaque and oldest fades to ~0. Drawn as a series of short segments rather
 * than one polyline because canvas2d doesn't support per-vertex alpha — each
 * segment has its own globalAlpha.
 */
export function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: ReadonlyArray<{ x: number; y: number }>,
  grid: OccupancyGrid,
  view: Viewport,
  cW: number,
  cH: number,
): void {
  if (trail.length < 2) return;

  const n = trail.length;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  for (let i = 1; i < n; i++) {
    const a = trail[i - 1];
    const b = trail[i];
    const [ax, ay] = project(a.x, a.y, grid, view, cW, cH);
    const [bx, by] = project(b.x, b.y, grid, view, cW, cH);

    const t = i / n; // 0 = oldest, 1 = newest
    ctx.globalAlpha = 0.05 + t * 0.55;
    ctx.strokeStyle = "rgba(34,211,238,1)";
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}
