"use client";

import { useEffect, useState } from "react";

/**
 * True after the mouse has rested for `idleMs`: the display hides the
 * pointer then, so it does not sit in the middle of the TV.
 */
export function useIdleCursor(idleMs = 4000): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let timer = setTimeout(() => setIdle(true), idleMs);
    const wake = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), idleMs);
    };
    window.addEventListener("mousemove", wake);
    window.addEventListener("pointerdown", wake);
    window.addEventListener("keydown", wake);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
    };
  }, [idleMs]);

  return idle;
}
