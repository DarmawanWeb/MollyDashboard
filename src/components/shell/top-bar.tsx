"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { setMobileNavOpen } from "@/hooks/use-ui-prefs";
import { PRESENTATION_PATH } from "@/lib/ui-prefs";
import { useUiStore } from "@/stores/use-ui-store";
import type { BrandLogos } from "@/types";
import { OperatorBar } from "./operator-bar";
import { ShowcaseBar } from "./showcase-bar";

/**
 * One top bar for every page, the same height and place: the visitor
 * display shows its branding there, the operator pages their title, robot
 * state and e-stop. On phones and tablets it opens the sidebar.
 */
export function TopBar({ logos }: { logos: BrandLogos }) {
  const pathname = usePathname();
  const open = useUiStore((s) => s.mobileNavOpen);

  return (
    <header className="@container relative z-30 shrink-0 border-b border-border-subtle bg-mol-root/70 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <button
          type="button"
          onClick={() => setMobileNavOpen(!open)}
          aria-label="Open menu"
          aria-controls="app-sidebar"
          aria-expanded={open}
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-border-subtle bg-mol-secondary text-txt-secondary transition-colors hover:text-txt-primary lg:hidden presenting:hidden"
        >
          <Menu className="size-5" />
        </button>
        {pathname === PRESENTATION_PATH ? (
          <ShowcaseBar logos={logos} />
        ) : (
          <OperatorBar pathname={pathname} />
        )}
      </div>
    </header>
  );
}
