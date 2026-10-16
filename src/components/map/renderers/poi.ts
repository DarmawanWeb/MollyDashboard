import type { OccupancyGrid } from "@/types/ros";
import type { POI } from "@/types/ui";
import { PALETTE } from "../palette";
import { projectPoiCell, type Viewport } from "../projection";

interface DrawPoisOptions {
  pois: POI[];
  activeId?: string | null;
  hoverId?: string | null;
  showLabels?: boolean;
}

/**
 * Draws all POIs as diamonds (rotated squares) with optional label below.
 *
 * Visual states:
 *   - default:  purple, no halo
 *   - hover:    purple, soft halo
 *   - active:   cyan, strong halo (matches robot color → suggests "this is
 *               where the robot is going / just was")
 *
 * Labels render when `showLabels` is true OR the POI is hovered/active.
 */
export function drawPois(
  ctx: CanvasRenderingContext2D,
  grid: OccupancyGrid,
  view: Viewport,
  cW: number,
  cH: number,
  opts: DrawPoisOptions,
): void {
  const { pois, activeId, hoverId, showLabels = false } = opts;

  for (const poi of pois) {
    const [px, py] = projectPoiCell(poi.x, poi.y, grid, view, cW, cH);
    if (px < -40 || px > cW + 40 || py < -40 || py > cH + 40) continue;

    const isActive = poi.id === activeId;
    const isHover = poi.id === hoverId;
    const color = isActive ? PALETTE.poiActive : PALETTE.poi;

    // halo
    if (isActive || isHover) {
      const haloR = isActive ? 16 : 12;
      const grad = ctx.createRadialGradient(px, py, 4, px, py, haloR);
      grad.addColorStop(
        0,
        isActive ? "rgba(34,211,238,0.35)" : "rgba(168,85,247,0.30)",
      );
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, haloR, 0, Math.PI * 2);
      ctx.fill();
    }

    // diamond
    const s = 6;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = color;
    ctx.fillRect(-s, -s, s * 2, s * 2);
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-s, -s, s * 2, s * 2);
    ctx.restore();

    // label
    const labelVisible = showLabels || isActive || isHover;
    if (labelVisible && poi.name) {
      drawPoiLabel(ctx, poi.name, px, py + 14);
    }
  }
}

function drawPoiLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  topY: number,
): void {
  ctx.font = "11px 'JetBrains Mono', monospace";
  const padX = 6;
  const padY = 3;
  const metrics = ctx.measureText(text);
  const w = metrics.width + padX * 2;
  const h = 16;
  const x = cx - w / 2;
  const y = topY;

  ctx.fillStyle = PALETTE.overlay;
  ctx.strokeStyle = PALETTE.overlayBorder;
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PALETTE.text;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, cx, y + h / 2 + padY * 0 + 0.5);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
