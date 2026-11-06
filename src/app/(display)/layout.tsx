import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers";

/** The visitor display: same robot connection and data as the operator pages. */
export default function DisplayLayout({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
