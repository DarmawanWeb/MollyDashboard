import type { OccupancyGrid } from "@/types/ros";
import { canvasFont, PALETTE } from "../palette";
import { project, type Viewport } from "../projection";

/** A tour drawn on the map, map frame. */
export interface MapRoute {
  /** Stops in visiting order */
  stops: ReadonlyArray<{ x: number; y: number }>;
  /** Where the robot walks after the last stop, null: it stays */
  returnTo: { x: number; y: number } | null;
}

/**
 * The legs of a tour: straight lines between its stops in visiting order
 * and the walk back after the last one, dashed. These show the order, not
 * the path: the robot plans each leg around obstacles when it walks it.
 * Drawn under the POI markers.
 */
export function drawRouteLegs(
  ctx: CanvasRenderingContext2D,
  route: MapRoute,
  grid: OccupancyGrid,
  view: Viewport,
  cW: number,
  cH: number,
): void {
  const points = route.stops.map((s) => project(s.x, s.y, grid, view, cW, cH));
  const last = points.at(-1);
  if (!last) return;

  ctx.save();
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (points.length > 1) {
    ctx.strokeStyle = PALETTE.route;
    ctx.beginPath();
    points.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  if (route.returnTo) {
    const [rx, ry] = project(
      route.returnTo.x,
      route.returnTo.y,
      grid,
      view,
      cW,
      cH,
    );
    ctx.strokeStyle = PALETTE.routeReturn;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(last[0], last[1]);
    ctx.lineTo(rx, ry);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Stop numbers next to the POI markers (top-left, clear of the label below
 * and of most headings). Drawn over the POI markers.
 */
export function drawRouteNumbers(
  ctx: CanvasRenderingContext2D,
  route: MapRoute,
  grid: OccupancyGrid,
  view: Viewport,
  cW: number,
  cH: number,
): void {
  ctx.save();
  ctx.font = canvasFont(10, 700);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  route.stops.forEach((stop, i) => {
    const [px, py] = project(stop.x, stop.y, grid, view, cW, cH);
    const bx = px - 12;
    const by = py - 12;
    ctx.fillStyle = PALETTE.poi;
    ctx.strokeStyle = PALETTE.bg;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(bx, by, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PALETTE.routeNumber;
    ctx.fillText(String(i + 1), bx, by + 0.5);
  });
  ctx.restore();
}
