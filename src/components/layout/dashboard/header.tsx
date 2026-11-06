"use client";

import { MonitorPlay } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PartnerLockup } from "@/components/brand/partner-lockup";
import { ActivityBadge } from "@/components/robot";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { TABS } from "@/constants/tabs";
import { cn } from "@/lib/utils";
import type { BrandLogos } from "@/types";
import { EstopButton } from "./estop-button";

export function Header({ logos }: { logos: BrandLogos }) {
  const pathname = usePathname();

  return (
    <header className="shrink-0 border-b border-border-subtle bg-mol-primary/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-mol-primary/75">
      <div className="flex h-14 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <PartnerLockup logos={logos} size="sm" className="hidden md:flex" />
          <div className="hidden h-6 w-px bg-border-subtle md:block" />
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold tracking-tight">
              Molly
            </span>
            <span className="rounded-full bg-mol-tertiary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-txt-tertiary">
              Operator
            </span>
          </div>
          <EstopButton />
          <ActivityBadge className="hidden 2xl:flex" />
        </div>

        <div className="flex items-center gap-2">
          <nav
            aria-label="Operator pages"
            className="flex gap-0.5 rounded-xl border border-border-subtle bg-mol-tertiary p-1"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = pathname === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "bg-mol-secondary text-txt-primary shadow-card"
                      : "text-txt-tertiary hover:text-txt-primary",
                  )}
                >
                  <Icon size={14} />
                  <span className="hidden lg:inline">{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          <Link
            href="/"
            className="bg-gradient-brand flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-on-brand shadow-card transition-opacity hover:opacity-90"
            title="Open the visitor display"
          >
            <MonitorPlay size={14} />
            <span className="hidden lg:inline">Display</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
