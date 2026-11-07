"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ConnectionBanner, ToastViewport } from "@/components/feedback";
import { AppProviders } from "@/components/providers";
import { DISPLAY_COPY } from "@/lib/display/copy";
import { PRESENTATION_PATH } from "@/lib/ui-prefs";
import { useDisplayStore } from "@/stores/use-display-store";
import type { BrandLogos } from "@/types";
import { PresentationHint } from "./presentation-controls";
import { ShellEffects } from "./shell-effects";
import { ShellFooter } from "./shell-footer";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

/**
 * The frame of every page: sidebar, top bar, page, footer. It stays mounted
 * while navigating, and so do the robot connection, the tour, the chat and
 * the map data behind it; only the page content fades in.
 */
export function AppShell({
  logos,
  children,
}: {
  logos: BrandLogos;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const showcase = pathname === PRESENTATION_PATH;
  const language = useDisplayStore((s) => s.language);

  return (
    <AppProviders>
      <ShellEffects />
      <div className="app-backdrop flex h-dvh overflow-hidden text-txt-primary">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <Sidebar logos={logos} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar logos={logos} />
          {!showcase && <ConnectionBanner />}
          <main
            id="main-content"
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col outline-none"
          >
            <div
              key={pathname}
              className="flex min-h-0 flex-1 flex-col animate-page-in"
            >
              {children}
            </div>
          </main>
          <ShellFooter />
        </div>
      </div>
      <ToastViewport />
      <PresentationHint copy={DISPLAY_COPY[language]} />
    </AppProviders>
  );
}
