import { create } from "zustand";
import type { ResolvedTheme, ThemeMode } from "@/types";

interface ThemeStore {
  /** What the person picked */
  mode: ThemeMode;
  /** What is shown right now */
  resolved: ResolvedTheme;
  setTheme: (mode: ThemeMode, resolved: ResolvedTheme) => void;
}

/**
 * Light / dark theme state. The root layout's init script sets
 * <html data-theme> before React runs; useTheme() and ThemeProvider own it
 * from then on (saving, applying, following the OS and other tabs).
 */
export const useThemeStore = create<ThemeStore>((set) => ({
  mode: "dark",
  resolved: "dark",
  setTheme: (mode, resolved) => set({ mode, resolved }),
}));
