import type { OccupancyGrid } from "@/types/ros";
import { PALETTE } from "../palette";
import { pixelsPerMeter, type Viewport } from "../projection";

/**
 * HUD overlays drawn in canvas-pixel space (no projection involved).
 * All three are positioned by absolute pixel offsets from the canvas edges.
 */

export function drawScaleBar(
  ctx: CanvasRenderingContext2D,
  grid: OccupancyGrid,
  view: Viewport,
  cW: number,
  cH: number,
): void {
  const ppm = pixelsPerMeter(grid, view, cW, cH);
  // pick a "nice" world length that renders between 60..140px
  const targets = [0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 50];
  let meters = 1;
  for (const t of targets) {
    const px = t * ppm;
    if (px >= 60 && px <= 140) {
      meters = t;
      break;
    }
    if (px > 140) {
      meters = t;
      break;
    }
  }
  const lenPx = meters * ppm;

  const x = 16;
  const y = cH - 24;

  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + lenPx, y);
  ctx.moveTo(x, y - 4);
  ctx.lineTo(x, y + 4);
  ctx.moveTo(x + lenPx, y - 4);
  ctx.lineTo(x + lenPx, y + 4);
  ctx.stroke();

  ctx.fillStyle = PALETTE.text;
  ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.fillText(`${meters} m`, x + lenPx + 8, y + 4);
}

export function drawCompass(ctx: CanvasRenderingContext2D, cW: number): void {
  // Compass is static (ROS map frame doesn't rotate) — always points +Y up.
  const cx = cW - 32;
  const cy = 32;
  const r = 16;

  ctx.fillStyle = PALETTE.overlay;
  ctx.strokeStyle = PALETTE.overlayBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // N arrow
  ctx.fillStyle = PALETTE.robot;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r + 4);
  ctx.lineTo(cx - 4, cy + 2);
  ctx.lineTo(cx + 4, cy + 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = PALETTE.text;
  ctx.font = "9px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("N", cx, cy + 11);
  ctx.textAlign = "left";
}

export function drawZoomBadge(
  ctx: CanvasRenderingContext2D,
  view: Viewport,
): void {
  const text = `${(view.zoom * 100).toFixed(0)}%`;
  const x = 16;
  const y = 16;

  ctx.font = "11px 'JetBrains Mono', monospace";
  const m = ctx.measureText(text);
  const w = m.width + 14;
  const h = 22;

  ctx.fillStyle = PALETTE.overlay;
  ctx.strokeStyle = PALETTE.overlayBorder;
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x + 0.5, y + 0.5, w, h);

  ctx.fillStyle = PALETTE.text;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 7, y + h / 2 + 0.5);
  ctx.textBaseline = "alphabetic";
}
