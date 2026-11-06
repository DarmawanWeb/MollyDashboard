/**
 * Light / dark theme: what the person picked (mode) and what is shown
 * (resolved). The choice is saved per browser under THEME_STORAGE_KEY and
 * applied to <html data-theme> before the first paint by THEME_INIT_SCRIPT.
 */

import type { ResolvedTheme, ThemeMode } from "@/types/ui";

export const THEME_STORAGE_KEY = "molly-theme";

/** Used when nothing is saved yet: the display is designed dark-first. */
export const DEFAULT_THEME_MODE: ThemeMode = "dark";

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function resolveTheme(
  mode: ThemeMode,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (mode === "system") return systemPrefersDark ? "dark" : "light";
  return mode;
}

export function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function readSavedTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(saved) ? saved : DEFAULT_THEME_MODE;
  } catch {
    return DEFAULT_THEME_MODE;
  }
}

export function saveTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // private mode / storage disabled: the choice lasts for this page
  }
}

/** Put the theme on <html> (CSS tokens and native controls follow). */
export function applyThemeToDocument(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
}

/**
 * Runs in <head> before the body paints, so a saved light theme never
 * flashes dark (or the other way round). Keep it dependency-free.
 */
export const THEME_INIT_SCRIPT = `(function(){var r=document.documentElement;try{var m=localStorage.getItem("${THEME_STORAGE_KEY}");if(m!=="light"&&m!=="dark"&&m!=="system")m="${DEFAULT_THEME_MODE}";var d=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);r.setAttribute("data-theme",d?"dark":"light");r.style.colorScheme=d?"dark":"light";}catch(e){r.setAttribute("data-theme","dark");}})();`;
