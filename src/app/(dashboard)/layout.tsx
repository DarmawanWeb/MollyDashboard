import type { ReactNode } from "react";
import { OperatorShell } from "@/components/layout/dashboard/operator-shell";
import { getBrandLogos } from "@/server/brand";

/** Operator pages: monitor, mapping, system, settings. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <OperatorShell logos={getBrandLogos()}>{children}</OperatorShell>;
}
