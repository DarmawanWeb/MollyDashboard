"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { DailyStatsTracker } from "@/components/display/daily-stats-tracker";
import { useDisplayMode } from "@/hooks/use-display-mode";
import { useIdleCursor } from "@/hooks/use-idle-cursor";
import {
  exitPresentation,
  onFullscreenChange,
  usePresenting,
} from "@/hooks/use-presentation";
import {
  hydrateUiPrefs,
  setMobileNavOpen,
  toggleSidebar,
} from "@/hooks/use-ui-prefs";
import { applyUiToDocument, PRESENTATION_PATH } from "@/lib/ui-prefs";
import { useUiStore } from "@/stores/use-ui-store";

/** A modal (history drawer) is open: Esc belongs to it. */
function modalOpen(): boolean {
  return document.querySelector('[data-modal-open="true"]') !== null;
}

/**
 * Side effects of the app shell, mounted once:
 * - saved sidebar / presentation preferences, mirrored on <html>
 * - Ctrl/⌘ B collapses the sidebar; Esc closes the drawer or leaves
 *   presentation mode (as does leaving fullscreen)
 * - the drawer closes on navigation and on growing to desktop; the
 *   pointer hides while presenting
 * - today's counters for the display, whatever page is open
 */
export function ShellEffects() {
  const pathname = usePathname();
  const hydrated = useUiStore((s) => s.hydrated);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const presenting = usePresenting();
  const idle = useIdleCursor(3500, presenting);
  const mode = useDisplayMode();

  useEffect(() => {
    hydrateUiPrefs();
  }, []);

  // until the saved preferences are read, <html> keeps what the init script set
  useEffect(() => {
    if (hydrated) applyUiToDocument(collapsed, presenting);
  }, [hydrated, collapsed, presenting]);

  useEffect(() => {
    void pathname;
    setMobileNavOpen(false);
  }, [pathname]);

  // the drawer is for phones and tablets: close it when the window grows
  // past the breakpoint where the sidebar is part of the page (lg)
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onChange = () => {
      if (desktop.matches) setMobileNavOpen(false);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (idle) root.setAttribute("data-idle-cursor", "on");
    else root.removeAttribute("data-idle-cursor");
    return () => root.removeAttribute("data-idle-cursor");
  }, [idle]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
        return;
      }
      if (e.key !== "Escape" || modalOpen()) return;
      const ui = useUiStore.getState();
      if (ui.mobileNavOpen) {
        setMobileNavOpen(false);
      } else if (
        ui.presentation &&
        window.location.pathname === PRESENTATION_PATH
      ) {
        exitPresentation();
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  return <DailyStatsTracker mode={mode} />;
}
