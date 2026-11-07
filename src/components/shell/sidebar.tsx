"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import { ChevronLeft, PawPrint, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompanyLogo } from "@/components/brand/company-logo";
import { BRAND } from "@/constants/brand";
import { isActivePath, NAV_SECTIONS, type NavItem } from "@/constants/nav";
import { type DisplayMode, useDisplayMode } from "@/hooks/use-display-mode";
import { setMobileNavOpen, toggleSidebar } from "@/hooks/use-ui-prefs";
import { cn } from "@/lib/utils";
import { useTourStore } from "@/stores/use-tour-store";
import { useUiStore } from "@/stores/use-ui-store";
import type { BrandLogos } from "@/types";
import { NavTooltip } from "./nav-tooltip";
import { RobotCard } from "./robot-card";

interface Badge {
  label: string;
  /** dot + pill colors */
  tone: "green" | "amber" | "muted";
  pulse?: boolean;
}

const TONE = {
  green: { dot: "bg-green", pill: "bg-green/12 text-green" },
  amber: { dot: "bg-amber", pill: "bg-amber/12 text-amber" },
  muted: { dot: "bg-txt-muted", pill: "bg-mol-elevated text-txt-tertiary" },
} as const;

const MODE_BADGE: Record<DisplayMode, Badge> = {
  live: { label: "Live", tone: "green", pulse: true },
  demo: { label: "Demo", tone: "amber" },
  offline: { label: "Off", tone: "muted" },
};

function useBadges(): Record<string, Badge | undefined> {
  const mode = useDisplayMode();
  const tour = useTourStore((s) => s.state);
  const touring =
    mode !== "offline" && (tour === "RUNNING" || tour === "PAUSED");
  return {
    "/": MODE_BADGE[mode],
    "/monitor": touring
      ? {
          label: tour === "PAUSED" ? "Paused" : "Tour",
          tone: tour === "PAUSED" ? "amber" : "green",
          pulse: tour === "RUNNING",
        }
      : undefined,
  };
}

function NavLink({
  item,
  active,
  badge,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  badge?: Badge;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const tone = badge ? TONE[badge.tone] : null;

  return (
    <NavTooltip enabled={collapsed} label={item.label}>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={item.label}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm transition-colors",
          "lg:sb-collapsed:justify-center lg:sb-collapsed:px-0",
          active
            ? "bg-mol-tertiary font-semibold text-txt-primary"
            : "font-medium text-txt-secondary hover:bg-mol-tertiary/70 hover:text-txt-primary",
        )}
      >
        {active && (
          <span
            aria-hidden
            className="absolute inset-y-2 -left-3 w-1 rounded-r-full bg-gradient-brand lg:sb-collapsed:-left-[0.9rem]"
          />
        )}
        <span
          className={cn(
            "relative grid size-9 shrink-0 place-items-center rounded-lg transition-all",
            active
              ? "bg-gradient-brand text-on-brand shadow-card"
              : "text-txt-tertiary group-hover:text-txt-primary",
          )}
        >
          <Icon className="size-[1.1rem]" />
          {tone && (
            <span
              aria-hidden
              className={cn(
                "absolute -top-0.5 -right-0.5 hidden size-2.5 rounded-full ring-2 ring-mol-primary lg:sb-collapsed:block",
                tone.dot,
              )}
            />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate lg:sb-collapsed:hidden">
          {item.label}
        </span>
        {badge && tone && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide lg:sb-collapsed:hidden",
              tone.pill,
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                tone.dot,
                badge.pulse && "animate-pulse-dot",
              )}
            />
            {badge.label}
          </span>
        )}
      </Link>
    </NavTooltip>
  );
}

/**
 * The navigation of every page: the visitor display and the operator pages,
 * with Molly's status and the partners at the bottom. Collapses to icons on
 * desktop (button on its edge, or Ctrl/⌘ B), slides in as a drawer on
 * phones and tablets, and disappears in presentation mode.
 */
export function Sidebar({ logos }: { logos: BrandLogos }) {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUiStore((s) => s.mobileNavOpen);
  const badges = useBadges();

  return (
    <>
      {/* drawer backdrop (phones, tablets) */}
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        onClick={() => setMobileNavOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/45 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        id="app-sidebar"
        aria-label="Navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[16.5rem] shrink-0 flex-col border-r border-border-subtle bg-mol-primary shadow-card-lg",
          "transition-[transform,width] duration-300 ease-out",
          "lg:relative lg:z-20 lg:translate-x-0 lg:bg-mol-primary/85 lg:shadow-none lg:backdrop-blur-xl",
          "lg:sb-collapsed:w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "presenting:hidden",
        )}
      >
        {/* brand */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border-subtle px-4 lg:sb-collapsed:justify-center lg:sb-collapsed:px-0">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
            aria-label={`${BRAND.robot} — Showcase`}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-on-brand shadow-card">
              <PawPrint className="size-5" />
            </span>
            <span className="min-w-0 leading-tight lg:sb-collapsed:hidden">
              <span className="block text-[1.05rem] font-extrabold tracking-tight">
                {BRAND.robot}
              </span>
              <span className="block truncate text-[0.7rem] font-medium text-txt-tertiary">
                by {BRAND.maker.short}
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
            className="ml-auto grid size-9 place-items-center rounded-xl text-txt-tertiary hover:bg-mol-tertiary hover:text-txt-primary lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* collapse toggle on the edge (desktop) */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={`${collapsed ? "Expand" : "Collapse"} sidebar (Ctrl/⌘ B)`}
          aria-controls="app-sidebar"
          aria-expanded={!collapsed}
          className="absolute top-[4.6rem] -right-3 z-10 hidden size-6 place-items-center rounded-full border border-border bg-mol-secondary text-txt-tertiary shadow-card transition-colors hover:text-txt-primary lg:grid"
        >
          <ChevronLeft className="size-3.5 transition-transform duration-300 lg:sb-collapsed:rotate-180" />
        </button>

        <Tooltip.Provider delay={120} closeDelay={0}>
          <nav className="flex-1 overflow-y-auto px-3 pt-5 pb-3">
            {NAV_SECTIONS.map((section) => (
              <div key={section.id} className="mb-5 last:mb-0">
                <div className="mb-1.5 px-2 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-txt-muted lg:sb-collapsed:hidden">
                  {section.label}
                </div>
                <div className="mx-auto mb-2 hidden h-px w-8 bg-border lg:sb-collapsed:block" />
                <ul className="flex flex-col gap-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <NavLink
                        item={item}
                        active={isActivePath(item.href, pathname)}
                        badge={badges[item.href]}
                        collapsed={collapsed}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="flex shrink-0 flex-col gap-3 px-3 pb-4">
            <RobotCard />
            <div className="px-1 lg:sb-collapsed:hidden">
              <div className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-txt-muted">
                In partnership
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <CompanyLogo
                  company={BRAND.partner}
                  files={logos.partner}
                  className="h-6 text-xs"
                />
                <CompanyLogo
                  company={BRAND.maker}
                  files={logos.maker}
                  className="h-6 text-xs"
                />
              </div>
            </div>
          </div>
        </Tooltip.Provider>
      </aside>
    </>
  );
}
