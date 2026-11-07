"use client";

import { Copyright, Credits } from "@/components/brand/credits";
import { useDisplayStore } from "@/stores/use-display-store";

/** Credits and copyright under every page. */
export function ShellFooter() {
  const language = useDisplayStore((s) => s.language);

  return (
    <footer className="@container shrink-0 border-t border-border-subtle bg-mol-root/50 px-4 text-xs text-txt-muted lg:px-6">
      <div className="flex min-h-10 flex-wrap items-center justify-center gap-x-4 gap-y-0.5 py-2 text-center @3xl:justify-between @3xl:py-0 @3xl:text-left">
        <Credits language={language} />
        <Copyright className="hidden shrink-0 @3xl:inline" />
      </div>
    </footer>
  );
}
