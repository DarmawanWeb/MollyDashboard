import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { getBrandLogos } from "@/server/brand";

/**
 * Every page, the visitor display and the operator pages, in one shell:
 * navigating between them keeps the robot connection and its state.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell logos={getBrandLogos()}>{children}</AppShell>;
}
