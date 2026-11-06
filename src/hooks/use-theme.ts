"use client";

import {
  applyThemeToDocument,
  readSavedTheme,
  resolveTheme,
  saveTheme,
  systemPrefersDark,
} from "@/lib/theme";
import { useThemeStore } from "@/stores/use-theme-store";
import type { ResolvedTheme, ThemeMode } from "@/types";

/** Pick a theme: saved per browser, applied at once. */
export function setThemeMode(mode: ThemeMode): void {
  const resolved = resolveTheme(mode, systemPrefersDark());
  saveTheme(mode);
  applyThemeToDocument(resolved);
  useThemeStore.getState().setTheme(mode, resolved);
}

/** Re-read the saved choice and the OS preference (mount, other tabs). */
export function syncTheme(): void {
  const mode = readSavedTheme();
  const resolved = resolveTheme(mode, systemPrefersDark());
  applyThemeToDocument(resolved);
  useThemeStore.getState().setTheme(mode, resolved);
}

export function useTheme(): {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
} {
  const mode = useThemeStore((s) => s.mode);
  const resolved = useThemeStore((s) => s.resolved);
  return {
    mode,
    resolved,
    setMode: setThemeMode,
    toggle: () => setThemeMode(resolved === "dark" ? "light" : "dark"),
  };
}
