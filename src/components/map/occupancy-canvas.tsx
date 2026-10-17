"use client";

import {
  type CSSProperties,
  type PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { OccupancyGrid } from "@/types/ros";
import type { PathPoint, POI, RobotPose } from "@/types/ui";
import { bakeGrid } from "./bake-grid";
import { useCanvasViewport } from "./hooks/use-canvas-viewport";
import { useRobotTrail } from "./hooks/use-robot-trail";
import { PALETTE } from "./palette";
import { pixelsPerMeter, project, unproject } from "./projection";
import { drawEmptyState } from "./renderers/empty-state";
import { drawGridLines } from "./renderers/grid-lines";
import { drawCompass, drawScaleBar, drawZoomBadge } from "./renderers/overlays";
import { drawGoal, drawPath } from "./renderers/path";
import { drawPlacement } from "./renderers/placement";
import { drawPois } from "./renderers/poi";
import { drawRobot } from "./renderers/robot";
import { drawTooltip } from "./renderers/tooltip";
import { drawTrail } from "./renderers/trail";
import { drawVisitors } from "./renderers/visitors";

const POI_HIT_RADIUS = 10; // pixels
const CLICK_SLOP_PX = 5; // pointer travel that still counts as a click
const HEADING_DRAG_PX = 10; // drag needed to set a heading while placing

export interface MapPlacement {
  /** Next click (and drag, for the heading) places a pose on the map. */
  active: boolean;
  /** Heading used when the click is not dragged (rad). */
  defaultYaw?: number;
  onPlace: (pose: { x: number; y: number; yaw: number }) => void;
}

export interface OccupancyCanvasProps {
  grid: OccupancyGrid | null;
  pose: RobotPose | null;
  pois: POI[];
  activePoiId?: string | null;
  selectedPoiId?: string | null;
  showPoiLabels?: boolean;
  /** Planned path, map frame */
  path?: ReadonlyArray<PathPoint>;
  /** Goal of the current walk */
  goal?: { x: number; y: number; yaw: number } | null;
  /** Visitors, already in the map frame */
  visitors?: ReadonlyArray<{ x: number; y: number; confidence: number }>;
  /** Place a pose by click + drag (POI editor) */
  placement?: MapPlacement;
  /** Fires when user clicks on empty space. World coords in meters. */
  onMapClick?: (world: { x: number; y: number }) => void;
  /** Fires when user clicks on an existing POI. */
  onPoiClick?: (poi: POI) => void;
  className?: string;
  style?: CSSProperties;
}

interface PlacementDrag {
  x: number;
  y: number;
  yaw: number;
  /** pointer position at the start, canvas pixels */
  px: number;
  py: number;
}

/**
 * Top-level map canvas. Composes the projection + renderer modules and
 * owns only the small amount of state that has to live in React:
 *   - canvas size (resize observer)
 *   - hover state for POI tooltip
 *   - viewport (via useCanvasViewport)
 *   - trail (via useRobotTrail)
 *   - the pose being placed (placement mode)
 *
 * Render strategy: a single rAF loop runs for the lifetime of the component
 * and reads all render inputs from a ref. This avoids restarting the loop
 * (and resetting the pulse phase) on every prop/state change, and sidesteps
 * Biome's strict `useExhaustiveDependencies` rule cleanly.
 */
export function OccupancyCanvas({
  grid,
  pose,
  pois,
  activePoiId = null,
  selectedPoiId = null,
  showPoiLabels = false,
  path = [],
  goal = null,
  visitors = [],
  placement,
  onMapClick,
  onPoiClick,
  className,
  style,
}: OccupancyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hoverPoiId, setHoverPoiId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [drag, setDrag] = useState<PlacementDrag | null>(null);
  const downRef = useRef<{ x: number; y: number } | null>(null);

  const vp = useCanvasViewport();
  const trail = useRobotTrail(pose);
  const placing = placement?.active === true;

  // Bake grid only when it actually changes (object identity).
  const bakedGrid = useMemo(() => (grid ? bakeGrid(grid) : null), [grid]);

  // Stash all render inputs in a ref so the rAF loop can always read the
  // latest without being a dependency. Updated every render.
  const renderInputs: RenderInputs = {
    size,
    grid,
    bakedGrid,
    pose,
    pois,
    activePoiId,
    selectedPoiId,
    showPoiLabels,
    hoverPoiId,
    hoverPos,
    viewport: vp.viewport,
    trail,
    path,
    goal,
    visitors,
    placementPreview: drag,
  };
  const renderInputsRef = useRef(renderInputs);
  renderInputsRef.current = renderInputs;

  // Track container size with ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (!r) return;
      setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Sync canvas backing store to size with DPR.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.max(1, size.w * dpr);
    c.height = Math.max(1, size.h * dpr);
    const ctx = c.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [size]);

  // Single rAF loop for component lifetime. Pulse stays continuous, all
  // render inputs read from the ref above.
  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const tick = (t: number) => {
      const elapsed = (t - start) / 1000;
      const pulse = (Math.sin(elapsed * 2.4) + 1) / 2; // 0..1, ~2.6s period

      const c = canvasRef.current;
      if (c) {
        const ctx = c.getContext("2d");
        if (ctx) renderFrame(ctx, pulse, renderInputsRef.current);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  function getCanvasPoint(e: PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function toWorld(px: number, py: number) {
    if (!grid) return null;
    const { wx, wy } = unproject(px, py, grid, vp.viewport, size.w, size.h);
    return { x: wx, y: wy };
  }

  function hitTestPoi(px: number, py: number): POI | null {
    if (!grid) return null;
    for (const poi of pois) {
      const [x, y] = project(poi.x, poi.y, grid, vp.viewport, size.w, size.h);
      if (Math.hypot(px - x, py - y) <= POI_HIT_RADIUS) return poi;
    }
    return null;
  }

  function handlePointerDown(e: PointerEvent<HTMLCanvasElement>) {
    if (e.button !== 0) return;
    const p = getCanvasPoint(e);
    downRef.current = p;
    if (placing) {
      const world = toWorld(p.x, p.y);
      if (!world) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDrag({ ...world, yaw: placement?.defaultYaw ?? 0, px: p.x, py: p.y });
      return;
    }
    vp.onPointerDown(e);
  }

  function handlePointerMove(e: PointerEvent<HTMLCanvasElement>) {
    const p = getCanvasPoint(e);
    if (drag) {
      const dx = p.x - drag.px;
      const dy = p.y - drag.py;
      if (Math.hypot(dx, dy) >= HEADING_DRAG_PX) {
        // canvas y points down: negate for the map frame
        setDrag({ ...drag, yaw: Math.atan2(-dy, dx) });
      }
      return;
    }
    vp.onPointerMove(e);
    if (vp.isPanning) {
      // don't update hover while panning — keeps tooltip from flickering
      return;
    }
    const hit = hitTestPoi(p.x, p.y);
    setHoverPoiId(hit ? hit.id : null);
    setHoverPos(hit ? p : null);
  }

  function handlePointerUp(e: PointerEvent<HTMLCanvasElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (drag) {
      placement?.onPlace({ x: drag.x, y: drag.y, yaw: drag.yaw });
      setDrag(null);
      downRef.current = null;
      return;
    }
    vp.onPointerUp(e);

    const down = downRef.current;
    downRef.current = null;
    const p = getCanvasPoint(e);
    if (!down || Math.hypot(p.x - down.x, p.y - down.y) > CLICK_SLOP_PX) {
      return; // a pan, not a click
    }
    const hit = hitTestPoi(p.x, p.y);
    if (hit) {
      onPoiClick?.(hit);
    } else if (onMapClick) {
      const world = toWorld(p.x, p.y);
      if (world) onMapClick(world);
    }
  }

  function handlePointerLeave() {
    setHoverPoiId(null);
    setHoverPos(null);
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
    >
      <canvas
        ref={canvasRef}
        onWheel={vp.onWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onDoubleClick={vp.resetView}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: placing ? "copy" : vp.isPanning ? "grabbing" : "crosshair",
          touchAction: "none",
        }}
        aria-label="Robot map"
      />
    </div>
  );
}

interface RenderInputs {
  size: { w: number; h: number };
  grid: OccupancyGrid | null;
  bakedGrid: HTMLCanvasElement | null;
  pose: RobotPose | null;
  pois: POI[];
  activePoiId: string | null;
  selectedPoiId: string | null;
  showPoiLabels: boolean;
  hoverPoiId: string | null;
  hoverPos: { x: number; y: number } | null;
  viewport: ReturnType<typeof useCanvasViewport>["viewport"];
  trail: ReturnType<typeof useRobotTrail>;
  path: ReadonlyArray<PathPoint>;
  goal: { x: number; y: number; yaw: number } | null;
  visitors: ReadonlyArray<{ x: number; y: number; confidence: number }>;
  placementPreview: { x: number; y: number; yaw: number } | null;
}

/** Module-scope render function — pure relative to its inputs. */
function renderFrame(
  ctx: CanvasRenderingContext2D,
  pulse: number,
  inp: RenderInputs,
): void {
  const {
    size: { w: cW, h: cH },
    grid,
    bakedGrid,
    pose,
    pois,
    activePoiId,
    selectedPoiId,
    showPoiLabels,
    hoverPoiId,
    hoverPos,
    viewport,
    trail,
    path,
    goal,
    visitors,
    placementPreview,
  } = inp;

  if (cW === 0 || cH === 0) return;

  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, cW, cH);

  if (!grid || !bakedGrid) {
    drawEmptyState(ctx, cW, cH);
    return;
  }

  const { width: W, height: H } = grid.info;
  const ppm = pixelsPerMeter(grid, viewport, cW, cH);
  const cellPx = ppm * grid.info.resolution;
  const [topLeftX, topLeftY] = project(
    grid.info.origin.position.x,
    grid.info.origin.position.y + H * grid.info.resolution,
    grid,
    viewport,
    cW,
    cH,
  );

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bakedGrid, topLeftX, topLeftY, W * cellPx, H * cellPx);
  ctx.imageSmoothingEnabled = true;

  drawGridLines(ctx, grid, viewport, cW, cH);
  drawTrail(ctx, trail, grid, viewport, cW, cH);
  drawPath(ctx, path, grid, viewport, cW, cH);
  if (goal) drawGoal(ctx, goal, grid, viewport, cW, cH);
  drawPois(ctx, grid, viewport, cW, cH, {
    pois,
    activeId: activePoiId,
    hoverId: hoverPoiId,
    selectedId: selectedPoiId,
    showLabels: showPoiLabels,
  });
  drawVisitors(ctx, visitors, grid, viewport, cW, cH);
  if (pose) {
    drawRobot(ctx, pose, grid, viewport, cW, cH, pulse);
  }
  if (placementPreview) {
    drawPlacement(ctx, placementPreview, grid, viewport, cW, cH);
  }

  drawZoomBadge(ctx, viewport);
  drawScaleBar(ctx, grid, viewport, cW, cH);
  drawCompass(ctx, cW);

  if (hoverPoiId && hoverPos) {
    const poi = pois.find((p) => p.id === hoverPoiId);
    if (poi) {
      drawTooltip(
        ctx,
        hoverPos.x,
        hoverPos.y,
        [
          { label: "name", value: poi.name },
          { label: "pos", value: `${poi.x.toFixed(2)}, ${poi.y.toFixed(2)} m` },
          {
            label: "yaw",
            value: `${Math.round((poi.yaw * 180) / Math.PI)}°`,
          },
          { label: "gesture", value: poi.gesture || "none" },
          { label: "dwell", value: `${poi.dwellSec}s` },
        ],
        cW,
      );
    }
  }
}
