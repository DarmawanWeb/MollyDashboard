/**
 * Mock occupancy grid used by the pages when rosbridge is disconnected (and
 * by the demo display): a 6m × 5m exhibition floor with an entrance, two
 * partitions, a few exhibit stands and a closed-off corner.
 *
 * Laid out around the seed POIs of the mock robot, so the straight walks of
 * the demo tour (Lobby → Hall A → Hall B → Garden → Lobby) never cross a
 * wall. The robot's default pose sits near the entrance, by the lobby.
 */

import type { OccupancyGrid } from "@/types/ros";

const W = 120;
const H = 100;
const RESOLUTION = 0.05;

const FREE = 0;
const WALL = 100;
const UNKNOWN = -1;

/** Rectangles in cells: column, row (row 0 = the bottom, y = -2.5 m), w, h. */
type Rect = readonly [number, number, number, number];

function buildMockGrid(): OccupancyGrid {
  const data = new Array<number>(W * H).fill(FREE);
  const fill = ([x, y, w, h]: Rect, value: number) => {
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        if (col >= 0 && col < W && row >= 0 && row < H) {
          data[row * W + col] = value;
        }
      }
    }
  };

  // outer walls
  const outer: Rect[] = [
    [0, 0, W, 2],
    [0, H - 2, W, 2],
    [0, 0, 2, H],
    [W - 2, 0, 2, H],
  ];
  for (const r of outer) fill(r, WALL);

  // a closed-off corner (top right): not part of the floor
  fill([102, 78, W - 102, H - 78], UNKNOWN);
  fill([100, 78, 2, H - 78], WALL);
  fill([100, 76, W - 100, 2], WALL);

  // the entrance in the bottom wall, by the lobby
  fill([30, 0, 12, 2], FREE);

  const inner: Rect[] = [
    // partition between the lobby and the west wing
    [2, 44, 18, 2],
    // partition of the east gallery
    [84, 56, 2, 20],
    // exhibit stands
    [46, 8, 12, 6],
    [58, 84, 10, 6],
    [104, 40, 8, 10],
    // planters by the garden
    [18, 80, 6, 10],
    [30, 92, 10, 4],
    // info desk in the lobby
    [8, 24, 10, 4],
  ];
  for (const r of inner) fill(r, WALL);

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
