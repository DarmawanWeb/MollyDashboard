"use client";

import { useCallback, useRef, useState } from "react";
import type { Viewport } from "../projection";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 8;
const WHEEL_STEP = 1.1;

export interface UseCanvasViewportResult {
  viewport: Viewport;
  setZoom: (z: number) => void;
  resetView: () => void;
  /** Attach to onWheel. Zooms around the cursor position. */
  onWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
  /** Attach to onPointerDown to start panning. */
  onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  /** Whether the user is currently dragging-to-pan */
  isPanning: boolean;
}

interface DragStart {
  px: number;
  py: number;
  panX: number;
  panY: number;
}

/**
 * Manages canvas zoom + pan state and pointer handlers.
 *
 * Zoom-to-cursor: when wheel zooms, the world point under the cursor stays
 * pinned to the same screen pixel. This is the standard map UX (Google Maps,
 * RViz, etc).
 *
 * Panning uses pointer capture so the drag continues even if the cursor
 * leaves the canvas mid-drag.
 */
export function useCanvasViewport(): UseCanvasViewportResult {
  const [viewport, setViewport] = useState<Viewport>({
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  const [isPanning, setIsPanning] = useState(false);
  const dragStart = useRef<DragStart | null>(null);

  const setZoom = useCallback((z: number) => {
    setViewport((v) => ({
      ...v,
      zoom: clamp(z, MIN_ZOOM, MAX_ZOOM),
    }));
  }, []);

  const resetView = useCallback(() => {
    setViewport({ zoom: 1, panX: 0, panY: 0 });
  }, []);

  const onWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    // Don't preventDefault here — React's onWheel is passive in newer
    // versions and we'd just get a console warning. The page won't scroll
    // because the canvas isn't tall enough to be inside a scroll container.
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const cW = rect.width;
    const cH = rect.height;

    setViewport((v) => {
      const dir = e.deltaY < 0 ? WHEEL_STEP : 1 / WHEEL_STEP;
      const nextZoom = clamp(v.zoom * dir, MIN_ZOOM, MAX_ZOOM);
      if (nextZoom === v.zoom) return v;

      // Pinpoint zoom: keep the canvas point (cx, cy) anchored.
      // Canvas center is at (cW/2 + panX, cH/2 + panY).
      // Offset from center: (cx - cW/2 - panX, cy - cH/2 - panY).
      // After zoom, that offset scales by ratio. We move panX/panY so the
      // post-zoom offset still passes through (cx, cy).
      const ratio = nextZoom / v.zoom;
      const offsetX = cx - cW / 2 - v.panX;
      const offsetY = cy - cH / 2 - v.panY;
      const newPanX = v.panX + offsetX * (1 - ratio);
      const newPanY = v.panY + offsetY * (1 - ratio);

      return { zoom: nextZoom, panX: newPanX, panY: newPanY };
    });
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsPanning(true);
      dragStart.current = {
        px: e.clientX,
        py: e.clientY,
        panX: viewport.panX,
        panY: viewport.panY,
      };
    },
    [viewport.panX, viewport.panY],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      // Snapshot the ref into a local — narrowing the local lets TS know
      // it's non-null inside the setViewport closure without `!` or `?.`.
      const start = dragStart.current;
      if (!start) return;
      const dx = e.clientX - start.px;
      const dy = e.clientY - start.py;
      setViewport((v) => ({
        ...v,
        panX: start.panX + dx,
        panY: start.panY + dy,
      }));
    },
    [],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setIsPanning(false);
      dragStart.current = null;
    },
    [],
  );

  return {
    viewport,
    setZoom,
    resetView,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    isPanning,
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
