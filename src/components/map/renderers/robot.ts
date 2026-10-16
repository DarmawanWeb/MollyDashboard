import type { OccupancyGrid } from "@/types/ros";
import type { RobotPose } from "@/types/ui";
import { PALETTE } from "../palette";
import { project, type Viewport } from "../projection";

/**
 * Draws the robot's current pose with:
 *   - pulsing outer glow (synced via `pulse` 0..1 from caller)
 *   - solid inner disc
 *   - heading arrow showing yaw direction
 *
 * The caller owns the pulse animation state — keeping it stateless here
 * means we don't need a render loop just for the glow if the rest of the
 * canvas is idle.
 */
export function drawRobot(
  ctx: CanvasRenderingContext2D,
  pose: RobotPose,
  grid: OccupancyGrid,
  view: Viewport,
  cW: number,
  cH: number,
  pulse: number, // 0..1
): void {
  const [px, py] = project(pose.x, pose.y, grid, view, cW, cH);

  // pulsing glow ring
  const glowR = 12 + pulse * 8;
  const grad = ctx.createRadialGradient(px, py, 4, px, py, glowR);
  grad.addColorStop(0, PALETTE.robotGlow);
  grad.addColorStop(1, "rgba(34,211,238,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(px, py, glowR, 0, Math.PI * 2);
  ctx.fill();

  // solid disc
  ctx.fillStyle = PALETTE.robot;
  ctx.beginPath();
  ctx.arc(px, py, 5, 0, Math.PI * 2);
  ctx.fill();

  // heading arrow — yaw is in ROS frame (CCW from +X). Y is flipped in
  // canvas, so we negate the sin component to point correctly.
  const len = 14;
  const dx = Math.cos(pose.yaw) * len;
  const dy = -Math.sin(pose.yaw) * len;
  ctx.strokeStyle = PALETTE.robot;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + dx, py + dy);
  ctx.stroke();

  // arrowhead
  const ah = 5;
  const angle = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(px + dx, py + dy);
  ctx.lineTo(
    px + dx - ah * Math.cos(angle - Math.PI / 6),
    py + dy - ah * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    px + dx - ah * Math.cos(angle + Math.PI / 6),
    py + dy - ah * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fillStyle = PALETTE.robot;
  ctx.fill();
}
