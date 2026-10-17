import type { OccupancyGrid } from "@/types/ros";
import type { POI } from "@/types/ui";
import { canvasFont, PALETTE } from "../palette";
import { project, type Viewport } from "../projection";

interface DrawPoisOptions {
  pois: POI[];
  activeId?: string | null;
  hoverId?: string | null;
  selectedId?: string | null;
  showLabels?: boolean;
}

/**
 * Draws all POIs as diamonds (rotated squares) with a heading tick (the yaw
 * the robot takes on arrival) and an optional label below.
 *
 * Visual states:
 *   - default:            purple, no halo
 *   - hover / selected:   purple, soft halo
 *   - active:             cyan, strong halo (matches robot color → suggests
 *                         "this is where the robot is going / just was")
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
  const { pois, activeId, hoverId, selectedId, showLabels = false } = opts;

  for (const poi of pois) {
    const [px, py] = project(poi.x, poi.y, grid, view, cW, cH);
    if (px < -40 || px > cW + 40 || py < -40 || py > cH + 40) continue;

    const isActive = poi.id === activeId;
    const isHover = poi.id === hoverId || poi.id === selectedId;
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

    drawHeading(ctx, px, py, poi.yaw, color, 15);

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

/**
 * Short line from (px, py) along a map-frame yaw. Canvas y points down, so
 * the sine component is negated.
 */
export function drawHeading(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  yaw: number,
  color: string,
  length: number,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + Math.cos(yaw) * length, py - Math.sin(yaw) * length);
  ctx.stroke();
}

function drawPoiLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  topY: number,
): void {
  ctx.font = canvasFont(11);
  const padX = 6;
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
  ctx.fillText(text, cx, y + h / 2 + 0.5);
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
