"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import { ChevronLeft, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/constants/brand";
import { isActivePath, NAV_SECTIONS, type NavItem } from "@/constants/nav";
import { type DisplayMode, useDisplayMode } from "@/hooks/use-display-mode";
import { setMobileNavOpen, toggleSidebar } from "@/hooks/use-ui-prefs";
import { cn } from "@/lib/utils";
import { useTourStore } from "@/stores/use-tour-store";
import { useUiStore } from "@/stores/use-ui-store";
import { MollyMark } from "./molly-mark";
import { NavTooltip } from "./nav-tooltip";
import { RobotCard } from "./robot-card";

interface Badge {
  label: string;
  dot: string;
  pulse?: boolean;
}

const MODE_BADGE: Record<DisplayMode, Badge> = {
  live: { label: "Live", dot: "bg-green", pulse: true },
  demo: { label: "Demo", dot: "bg-amber" },
  offline: { label: "Off", dot: "bg-txt-muted" },
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
          dot: tour === "PAUSED" ? "bg-amber" : "bg-green",
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

  return (
    <NavTooltip enabled={collapsed} label={item.label}>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={item.label}
        className={cn(
          "group relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[0.84rem] transition-colors",
          "lg:sb-collapsed:mx-auto lg:sb-collapsed:w-10 lg:sb-collapsed:justify-center lg:sb-collapsed:px-0",
          active
            ? "bg-mol-secondary font-medium text-txt-primary shadow-card ring-1 ring-border-subtle"
            : "text-txt-secondary hover:bg-mol-tertiary hover:text-txt-primary",
        )}
      >
        <span className="relative shrink-0">
          <Icon
            className={cn(
              "size-[1.05rem] transition-colors",
              active
                ? "text-brand"
                : "text-txt-tertiary group-hover:text-txt-primary",
            )}
          />
          {badge && (
            <span
              aria-hidden
              className={cn(
                "absolute -top-1 -right-1 hidden size-2 rounded-full ring-2 ring-mol-primary lg:sb-collapsed:block",
                badge.dot,
              )}
            />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate lg:sb-collapsed:hidden">
          {item.label}
        </span>
        {badge && (
          <span className="flex items-center gap-1.5 text-[0.7rem] font-medium text-txt-tertiary lg:sb-collapsed:hidden">
            <span
              className={cn(
                "size-1.5 rounded-full",
                badge.dot,
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
 * with Molly's status at the bottom. Collapses to icons on desktop (button
 * on its edge, or Ctrl/⌘ B), slides in as a drawer on phones and tablets,
 * and disappears in presentation mode.
 */
export function Sidebar() {
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
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        id="app-sidebar"
        aria-label="Navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border-subtle bg-mol-primary",
          "transition-[transform,width] duration-300 ease-out",
          "lg:relative lg:z-20 lg:translate-x-0",
          "lg:sb-collapsed:w-[4.5rem]",
          mobileOpen
            ? "translate-x-0 shadow-card-lg"
            : "-translate-x-full lg:shadow-none",
          "presenting:hidden",
        )}
      >
        {/* brand */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border-subtle px-4 lg:sb-collapsed:justify-center lg:sb-collapsed:px-0">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5"
            aria-label={`${BRAND.robot} — Showcase`}
          >
            <MollyMark className="size-8" />
            <span className="min-w-0 leading-tight lg:sb-collapsed:hidden">
              <span className="block text-[0.95rem] font-semibold tracking-tight">
                {BRAND.robot}
              </span>
              <span className="block truncate text-[0.7rem] text-txt-tertiary">
                {BRAND.maker.short}
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
            className="ml-auto grid size-8 place-items-center rounded-lg text-txt-tertiary hover:bg-mol-tertiary hover:text-txt-primary lg:hidden"
          >
            <X className="size-[1.05rem]" />
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
          <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-3">
            {NAV_SECTIONS.map((section) => (
              <div key={section.id} className="mb-5 last:mb-0">
                <div className="mb-1 px-2.5 text-[0.7rem] font-medium text-txt-muted lg:sb-collapsed:hidden">
                  {section.label}
                </div>
                <div className="mx-auto mb-2 hidden h-px w-6 bg-border lg:sb-collapsed:block" />
                <ul className="flex flex-col gap-0.5">
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

          <div className="shrink-0 p-3">
            <RobotCard />
          </div>
        </Tooltip.Provider>
      </aside>
    </>
  );
}
