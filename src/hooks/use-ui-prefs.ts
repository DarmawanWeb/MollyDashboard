"use client";

import { presentParam, readUiPrefs, saveUiPrefs } from "@/lib/ui-prefs";
import { useUiStore } from "@/stores/use-ui-store";

function persist(): void {
  const { sidebarCollapsed, presentation } = useUiStore.getState();
  saveUiPrefs({ sidebarCollapsed, presentation });
}

/** Read the saved shell preferences and the `?present=` parameter. */
export function hydrateUiPrefs(): void {
  const prefs = readUiPrefs();
  const param = presentParam(window.location.search);
  const presentation = param ?? prefs.presentation;
  useUiStore.getState().set({
    sidebarCollapsed: prefs.sidebarCollapsed,
    presentation,
    hydrated: true,
  });
  if (param !== null) persist();
}

export function setSidebarCollapsed(collapsed: boolean): void {
  useUiStore.getState().set({ sidebarCollapsed: collapsed });
  persist();
}

export function toggleSidebar(): void {
  setSidebarCollapsed(!useUiStore.getState().sidebarCollapsed);
}

export function setPresentationPref(on: boolean): void {
  useUiStore.getState().set({ presentation: on });
  persist();
}

export function setMobileNavOpen(open: boolean): void {
  useUiStore.getState().set({ mobileNavOpen: open });
}
