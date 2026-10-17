"use client";

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const HOLD_KEYS = new Set([" ", "Enter"]);

/**
 * Press and hold for `holdMs` to confirm (e.g. releasing the e-stop).
 * `progress` runs 0..1 while held; letting go early cancels. `handlers`
 * spread onto a button wire pointer, touch and keyboard (Space / Enter).
 */
export function useHoldToConfirm(holdMs: number, onConfirm: () => void) {
  const [progress, setProgress] = useState(0);
  const frameRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const confirmRef = useRef(onConfirm);

  useEffect(() => {
    confirmRef.current = onConfirm;
  }, [onConfirm]);

  const cancel = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    startRef.current = null;
    setProgress(0);
  }, []);

  const start = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    startRef.current = performance.now();
    const step = (t: number) => {
      const begun = startRef.current;
      if (begun === null) return;
      const p = Math.min(1, Math.max(0, (t - begun) / holdMs));
      setProgress(p);
      if (p >= 1) {
        startRef.current = null;
        setProgress(0);
        confirmRef.current();
        return;
      }
      frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
  }, [holdMs]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const handlers = {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onBlur: cancel,
    onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
    onKeyDown: (e: KeyboardEvent) => {
      if (!HOLD_KEYS.has(e.key)) return;
      e.preventDefault();
      if (!e.repeat) start();
    },
    onKeyUp: (e: KeyboardEvent) => {
      if (HOLD_KEYS.has(e.key)) cancel();
    },
  };

  return { progress, start, cancel, handlers };
}
