"use client";
import type React from "react";
import { ConnectionBanner, ToastViewport } from "@/components/feedback";
import { Footer } from "@/components/layout/dashboard/footer";
import { Header } from "@/components/layout/dashboard/header";
import { AppProviders } from "@/components/providers";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <div className="h-screen flex flex-col bg-mol-root text-txt-primary font-sans">
        {/*
          Skip-link for keyboard users. Hidden visually until focused —
          then jumps to the main content, bypassing header + tabs.
        */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <Header />
        <ConnectionBanner />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 flex min-h-0 w-full overflow-hidden outline-none"
        >
          {children}
        </main>

        <Footer />
        <ToastViewport />
      </div>
    </AppProviders>
  );
}
