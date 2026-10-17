"use client";

import { Bot } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ActivityBadge } from "@/components/robot";
import { TABS } from "@/constants/tabs";
import { cn } from "@/lib/utils";
import { EstopButton } from "./estop-button";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="h-13 shrink-0 border-b border-border-subtle bg-mol-primary px-5">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center border border-border bg-mol-tertiary">
              <Bot size={18} className="text-cyan" />
            </div>

            <div className="flex items-end gap-2">
              <span className="font-mono text-base font-bold tracking-tight">
                MOLLY
              </span>
              <span className="text-[11px] text-txt-muted">v0.2.0</span>
            </div>
          </div>

          {/* E-STOP */}
          <div className="h-6 w-px bg-border-subtle" />
          <EstopButton />
          <ActivityBadge className="hidden xl:flex" />
        </div>

        {/* Tabs */}
        <nav className="flex gap-0.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href;

            return (
              <button
                key={tab.href}
                type="button"
                onClick={() => router.push(tab.href)}
                className={cn(
                  "flex items-center gap-1.5 border px-3.5 py-1.5 font-mono text-xs transition-colors",
                  active
                    ? "border-border-strong bg-mol-elevated text-txt-primary"
                    : "border-transparent text-txt-tertiary hover:text-txt-secondary",
                )}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
