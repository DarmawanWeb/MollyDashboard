/**
 * Mock occupancy grid used by /monitor and /mapping pages when rosbridge
 * is disconnected. Synthesizes a 6m × 5m floor plan with walls, four
 * rooms, doorways, and some scattered unknown patches.
 *
 * Dimensions chosen so the robot's default pose at (0, 0) sits roughly
 * in the central corridor.
 */

import type { OccupancyGrid } from "@/types/ros";

const W = 120;
const H = 100;
const RESOLUTION = 0.05;

function buildMockGrid(): OccupancyGrid {
  const data = new Array<number>(W * H).fill(0);

  // outer walls
  for (let x = 0; x < W; x++) {
    data[x] = 100;
    data[(H - 1) * W + x] = 100;
  }
  for (let y = 0; y < H; y++) {
    data[y * W] = 100;
    data[y * W + W - 1] = 100;
  }

  // inner room walls
  const walls: ReadonlyArray<readonly [number, number, number, number]> = [
    [20, 10, 2, 60],
    [60, 10, 2, 60],
    [20, 40, 40, 2],
    [20, 70, 40, 2],
  ];
  for (const [x, y, w, h] of walls) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        data[(y + dy) * W + (x + dx)] = 100;
      }
    }
  }

  // doorways punched through the inner walls
  const doors: ReadonlyArray<readonly [number, number, number, number]> = [
    [20, 30, 2, 4],
    [20, 55, 2, 4],
    [60, 25, 2, 4],
    [60, 55, 2, 4],
  ];
  for (const [x, y, w, h] of doors) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        data[(y + dy) * W + (x + dx)] = 0;
      }
    }
  }

  // scattered unknown patches for visual texture
  for (let i = 0; i < 400; i++) {
    const idx = Math.floor(Math.random() * data.length);
    if (data[idx] === 0) data[idx] = -1;
  }

  return {
    header: {
      stamp: { sec: 0, nanosec: 0 },
      frame_id: "map",
    },
    info: {
      map_load_time: { sec: 0, nanosec: 0 },
      resolution: RESOLUTION,
      width: W,
      height: H,
      origin: {
        // place origin so world (0,0) is at the grid center
        position: { x: -3, y: -2.5, z: 0 },
        orientation: { x: 0, y: 0, z: 0, w: 1 },
      },
    },
    data,
  };
}

/**
 * Singleton mock grid — built once on first access.
 *
 * `let` rather than direct const because the build is non-trivial and we
 * don't want it eagerly evaluated at module-load time during SSR.
 */
let _mockGrid: OccupancyGrid | null = null;

export function getMockOccupancyGrid(): OccupancyGrid {
  if (!_mockGrid) _mockGrid = buildMockGrid();
  return _mockGrid;
}
