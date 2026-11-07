"use client";

import { usePathname } from "next/navigation";
import { PRESENTATION_PATH } from "@/lib/ui-prefs";
import { useUiStore } from "@/stores/use-ui-store";
import { setPresentationPref } from "./use-ui-prefs";

/** Fullscreen was requested by presentation mode (so leaving it ends it). */
let ownsFullscreen = false;

/** Visitor display without the operator chrome, full screen if allowed. */
export function enterPresentation(): void {
  setPresentationPref(true);
  const root = document.documentElement;
  if (document.fullscreenElement || !root.requestFullscreen) return;
  root
    .requestFullscreen()
    .then(() => {
      ownsFullscreen = true;
    })
    .catch(() => {
      // not allowed here (iframe, kiosk browser): presentation still applies
    });
}

export function exitPresentation(): void {
  setPresentationPref(false);
  if (ownsFullscreen && document.fullscreenElement) {
    ownsFullscreen = false;
    void document.exitFullscreen().catch(() => {});
  }
}

/** The browser left fullscreen (Esc, F11): end presentation with it. */
export function onFullscreenChange(): void {
  if (!document.fullscreenElement && ownsFullscreen) {
    ownsFullscreen = false;
    setPresentationPref(false);
  }
}

/** True while the visitor display is shown in presentation mode. */
export function usePresenting(): boolean {
  const pathname = usePathname();
  const presentation = useUiStore((s) => s.presentation);
  return presentation && pathname === PRESENTATION_PATH;
}
