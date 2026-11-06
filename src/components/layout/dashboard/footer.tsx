"use client";

import { Copyright, Credits } from "@/components/brand/credits";
import { useMockMode } from "@/hooks/use-mock-mode";
import { cn } from "@/lib/utils";
import { useRobotStore } from "@/stores/use-robot-store";
import { useSiteStore } from "@/stores/use-site-store";

const STATUS = {
  connected: { dot: "bg-green", text: "text-green", label: "Connected" },
  reconnecting: {
    dot: "bg-amber motion-safe:animate-pulse",
    text: "text-amber",
    label: "Reconnecting",
  },
  disconnected: { dot: "bg-red", text: "text-red", label: "Disconnected" },
} as const;

export function Footer() {
  const connectionStatus = useRobotStore((state) => state.connectionStatus);
  const site = useSiteStore((s) => s.status.site);
  const mock = useMockMode();
  const status = STATUS[connectionStatus] ?? STATUS.disconnected;

  return (
    <footer className="flex h-9 shrink-0 items-center justify-between gap-4 border-t border-border-subtle bg-mol-primary px-4 text-[11px] text-txt-muted">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span aria-hidden className={cn("size-2 rounded-full", status.dot)} />
          <span className={cn("font-semibold", status.text)}>
            {status.label}
          </span>
          {mock && <span className="text-amber">· mock robot</span>}
        </div>
        <span className="hidden sm:inline">
          {site ? `Site ${site}` : "No site loaded"}
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-4 truncate">
        <Credits className="hidden md:inline-flex" />
        <Copyright className="hidden xl:inline" />
      </div>
    </footer>
  );
}
