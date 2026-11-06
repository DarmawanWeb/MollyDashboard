"use client";

import { type ReactNode, useEffect } from "react";
import { setCanvasTheme } from "@/components/map/palette";
import { syncTheme } from "@/hooks/use-theme";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { useThemeStore } from "@/stores/use-theme-store";

/**
 * Keeps the theme in step with the saved choice: on mount, when the OS
 * switches light / dark (mode "system"), and when another tab changes it
 * (the operator flips it on a laptop, the display follows). The map canvas
 * palette follows the resolved theme.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const stopCanvas = useThemeStore.subscribe((s) =>
      setCanvasTheme(s.resolved),
    );
    syncTheme();
    setCanvasTheme(useThemeStore.getState().resolved);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (useThemeStore.getState().mode === "system") syncTheme();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) syncTheme();
    };

    media.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);
    return () => {
      stopCanvas();
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return <>{children}</>;
}
