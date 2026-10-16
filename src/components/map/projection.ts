/**
 * Pure 2D projection helpers for the occupancy canvas.
 *
 * Coordinate frames:
 *   - world (meters): ROS map frame, origin at map.info.origin
 *   - grid cell: integer cell indices 0..width-1 / 0..height-1
 *   - canvas pixel: top-left origin, y-down (DOM convention)
 *
 * The canvas flips Y because ROS uses y-up and DOM uses y-down.
 */

import type { OccupancyGrid } from "@/types/ros";

export interface Viewport {
  /** Zoom multiplier (1 = fit-to-canvas) */
  zoom: number;
  /** Pan offset in pixels (x, y) */
  panX: number;
  panY: number;
}

/** Origin (x, y) extracted from grid.info.origin.position for ergonomic 2D use */
function gridOrigin(grid: OccupancyGrid): { x: number; y: number } {
  return {
    x: grid.info.origin.position.x,
    y: grid.info.origin.position.y,
  };
}

/** Pixels per world meter at the current viewport */
export function pixelsPerMeter(
  grid: OccupancyGrid,
  view: Viewport,
  canvasW: number,
  canvasH: number,
): number {
  const fit = Math.min(canvasW / grid.info.width, canvasH / grid.info.height);
  return (fit * view.zoom) / grid.info.resolution;
}

/**
 * Project a world coordinate (meters) onto canvas pixel space.
 * Returns [px, py].
 */
export function project(
  wx: number,
  wy: number,
  grid: OccupancyGrid,
  view: Viewport,
  canvasW: number,
  canvasH: number,
): [number, number] {
  const { width: W, height: H, resolution } = grid.info;
  const origin = gridOrigin(grid);
  const fit = Math.min(canvasW / W, canvasH / H);
  const scale = fit * view.zoom;

  // grid cell coords (origin bottom-left in ROS convention)
  const gx = (wx - origin.x) / resolution;
  const gy = (wy - origin.y) / resolution;

  const cx = canvasW / 2 + view.panX;
  const cy = canvasH / 2 + view.panY;

  const px = cx + (gx - W / 2) * scale;
  const py = cy - (gy - H / 2) * scale; // y flip
  return [px, py];
}

/**
 * Inverse of `project`: canvas pixels → world coords + grid cell coords.
 */
export function unproject(
  px: number,
  py: number,
  grid: OccupancyGrid,
  view: Viewport,
  canvasW: number,
  canvasH: number,
): { wx: number; wy: number; gx: number; gy: number } {
  const { width: W, height: H, resolution } = grid.info;
  const origin = gridOrigin(grid);
  const fit = Math.min(canvasW / W, canvasH / H);
  const scale = fit * view.zoom;
  const cx = canvasW / 2 + view.panX;
  const cy = canvasH / 2 + view.panY;

  const gx = (px - cx) / scale + W / 2;
  const gy = -(py - cy) / scale + H / 2; // y flip

  return {
    wx: gx * resolution + origin.x,
    wy: gy * resolution + origin.y,
    gx,
    gy,
  };
}

/**
 * Project a POI's grid-cell coords to canvas pixels.
 * POI x/y are stored as grid cells in the UI domain, not world meters.
 */
export function projectPoiCell(
  cellX: number,
  cellY: number,
  grid: OccupancyGrid,
  view: Viewport,
  canvasW: number,
  canvasH: number,
): [number, number] {
  const { resolution } = grid.info;
  const origin = gridOrigin(grid);
  const wx = cellX * resolution + origin.x;
  const wy = cellY * resolution + origin.y;
  return project(wx, wy, grid, view, canvasW, canvasH);
}
