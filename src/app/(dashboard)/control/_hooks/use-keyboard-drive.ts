"use client";

import { useEffect, useRef } from "react";
import type { TeleopDirection } from "@/hooks/use-teleop";

/** Physical keys (KeyboardEvent.code), so WASD works on any layout. */
export const DRIVE_KEYS: Readonly<Record<string, TeleopDirection>> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  KeyD: "right",
  KeyQ: "turn_left",
  ArrowLeft: "turn_left",
  KeyE: "turn_right",
  ArrowRight: "turn_right",
};

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * Hold-to-drive from the keyboard while `enabled`: a drive key starts the
 * hold, releasing that key ends it. Typing in a form field never drives.
 */
export function useKeyboardDrive(
  enabled: boolean,
  startHold: (direction: TeleopDirection) => void,
  release: () => void,
): void {
  const keyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const down = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;
      const direction = DRIVE_KEYS[e.code];
      if (!direction) return;
      e.preventDefault();
      keyRef.current = e.code;
      startHold(direction);
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== keyRef.current) return;
      keyRef.current = null;
      release();
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      if (keyRef.current) {
        keyRef.current = null;
        release();
      }
    };
  }, [enabled, startHold, release]);
}
