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
import type { POI, RobotPose } from "@/types/ui";
import { bakeGrid } from "./bake-grid";
import { useCanvasViewport } from "./hooks/use-canvas-viewport";
import { useRobotTrail } from "./hooks/use-robot-trail";
import { PALETTE } from "./palette";
import {
  pixelsPerMeter,
  project,
  projectPoiCell,
  unproject,
} from "./projection";
import { drawEmptyState } from "./renderers/empty-state";
import { drawGridLines } from "./renderers/grid-lines";
import { drawCompass, drawScaleBar, drawZoomBadge } from "./renderers/overlays";
import { drawPois } from "./renderers/poi";
import { drawRobot } from "./renderers/robot";
import { drawTooltip } from "./renderers/tooltip";
import { drawTrail } from "./renderers/trail";

const POI_HIT_RADIUS = 10; // pixels

export interface OccupancyCanvasProps {
  grid: OccupancyGrid | null;
  pose: RobotPose | null;
  pois: POI[];
  activePoiId?: string | null;
  showPoiLabels?: boolean;
  /** Fires when user clicks on empty space. World coords in meters. */
  onMapClick?: (world: { x: number; y: number }) => void;
  /** Fires when user clicks on an existing POI. */
  onPoiClick?: (poi: POI) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Top-level map canvas. Composes the projection + renderer modules and
 * owns only the small amount of state that has to live in React:
 *   - canvas size (resize observer)
 *   - hover state for POI tooltip
 *   - viewport (via useCanvasViewport)
 *   - trail (via useRobotTrail)
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
  showPoiLabels = false,
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

  const vp = useCanvasViewport();
  const trail = useRobotTrail(pose);

  // Bake grid only when it actually changes (object identity).
  const bakedGrid = useMemo(() => (grid ? bakeGrid(grid) : null), [grid]);

  // Stash all render inputs in a ref so the rAF loop can always read the
  // latest without being a dependency. Updated every render.
  const renderInputsRef = useRef({
    size,
    grid,
    bakedGrid,
    pose,
    pois,
    activePoiId,
    showPoiLabels,
    hoverPoiId,
    hoverPos,
    viewport: vp.viewport,
    trail,
  });
  renderInputsRef.current = {
    size,
    grid,
    bakedGrid,
    pose,
    pois,
    activePoiId,
    showPoiLabels,
    hoverPoiId,
    hoverPos,
    viewport: vp.viewport,
    trail,
  };

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

  function hitTestPoi(px: number, py: number): POI | null {
    if (!grid) return null;
    for (const poi of pois) {
      const [x, y] = projectPoiCell(
        poi.x,
        poi.y,
        grid,
        vp.viewport,
        size.w,
        size.h,
      );
      if (Math.hypot(px - x, py - y) <= POI_HIT_RADIUS) return poi;
    }
    return null;
  }

  function handlePointerMove(e: PointerEvent<HTMLCanvasElement>) {
    vp.onPointerMove(e);
    if (vp.isPanning) {
      // don't update hover while panning — keeps tooltip from flickering
      return;
    }
    const { x, y } = getCanvasPoint(e);
    const hit = hitTestPoi(x, y);
    setHoverPoiId(hit ? hit.id : null);
    setHoverPos(hit ? { x, y } : null);
  }

  function handlePointerLeave() {
    setHoverPoiId(null);
    setHoverPos(null);
  }

  function handleClick(e: PointerEvent<HTMLCanvasElement>) {
    if (!grid) return;
    // Distinguish click from drag — if pan moved, ignore.
    if (vp.isPanning) return;
    const { x, y } = getCanvasPoint(e);
    const hit = hitTestPoi(x, y);
    if (hit) {
      onPoiClick?.(hit);
    } else if (onMapClick) {
      const { wx, wy } = unproject(x, y, grid, vp.viewport, size.w, size.h);
      onMapClick({ x: wx, y: wy });
    }
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
        onPointerDown={vp.onPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => {
          vp.onPointerUp(e);
          handleClick(e);
        }}
        onPointerLeave={handlePointerLeave}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: vp.isPanning ? "grabbing" : "crosshair",
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
  showPoiLabels: boolean;
  hoverPoiId: string | null;
  hoverPos: { x: number; y: number } | null;
  viewport: ReturnType<typeof useCanvasViewport>["viewport"];
  trail: ReturnType<typeof useRobotTrail>;
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
    showPoiLabels,
    hoverPoiId,
    hoverPos,
    viewport,
    trail,
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
  drawPois(ctx, grid, viewport, cW, cH, {
    pois,
    activeId: activePoiId,
    hoverId: hoverPoiId,
    showLabels: showPoiLabels,
  });
  if (pose) {
    drawRobot(ctx, pose, grid, viewport, cW, cH, pulse);
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
          { label: "cell", value: `${poi.x}, ${poi.y}` },
          { label: "motion", value: poi.motionAction ?? "none" },
        ],
        cW,
      );
    }
  }
}
