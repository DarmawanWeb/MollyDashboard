"use client";

import type { ReactNode } from "react";
import { ConnectionBanner, ToastViewport } from "@/components/feedback";
import { AppProviders } from "@/components/providers";
import type { BrandLogos } from "@/types";
import { Footer } from "./footer";
import { Header } from "./header";

/** Chrome of the operator pages: header with tabs and e-stop, footer. */
export function OperatorShell({
  logos,
  children,
}: {
  logos: BrandLogos;
  children: ReactNode;
}) {
  return (
    <AppProviders>
      <div className="flex h-dvh flex-col overflow-hidden bg-mol-root text-txt-primary">
        {/*
          Skip-link for keyboard users. Hidden visually until focused —
          then jumps to the main content, bypassing header + tabs.
        */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <Header logos={logos} />
        <ConnectionBanner />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex min-h-0 w-full flex-1 overflow-hidden outline-none"
        >
          {children}
        </main>

        <Footer />
        <ToastViewport />
      </div>
    </AppProviders>
  );
}
