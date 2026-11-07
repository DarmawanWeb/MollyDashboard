import { create } from "zustand";

interface UiStore {
  sidebarCollapsed: boolean;
  /** Presentation mode of the visitor display (saved choice) */
  presentation: boolean;
  /** Saved preferences were read (until then the defaults render) */
  hydrated: boolean;
  /** Sidebar drawer on phones and tablets */
  mobileNavOpen: boolean;
  set: (patch: Partial<Omit<UiStore, "set">>) => void;
}

/**
 * App shell state: sidebar, presentation mode, mobile drawer. Saving and
 * the <html> attributes that style them are handled by hooks/use-ui-prefs
 * and ShellEffects.
 */
export const useUiStore = create<UiStore>((set) => ({
  sidebarCollapsed: false,
  presentation: false,
  hydrated: false,
  mobileNavOpen: false,
  set: (patch) => set(patch),
}));
