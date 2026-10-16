"use client";

import { Bot, OctagonX } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { TABS } from "@/constants/tabs";
import { cn } from "@/lib/utils";
import { useRobotStore } from "@/stores/use-robot-store";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const isEstop = useRobotStore((state) => state.isEstop);
  const toggleEstop = useRobotStore((state) => state.toggleEstop);

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
              <span className="text-[11px] text-txt-muted">v0.1.0</span>
            </div>
          </div>

          {/* E-STOP */}
          <div className="h-6 w-px bg-border-subtle" />

          <button
            type="button"
            onClick={toggleEstop}
            className={cn(
              "flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95",
              isEstop
                ? "animate-pulse border-red bg-red text-white"
                : "border-red/30 bg-red/10 text-red hover:bg-red/20",
            )}
          >
            <OctagonX size={14} />
            {isEstop ? "E-STOP ACTIVE" : "E-STOP"}
          </button>
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
