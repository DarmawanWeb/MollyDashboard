"use client";

import { AlertOctagon, RotateCcw } from "lucide-react";
import { MollyButton } from "@/components/ui/molly";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
  /** Route name for the header — e.g. "Monitor", "Mapping" */
  route: string;
}

/**
 * Full-page error fallback for Next.js per-route error.tsx files.
 *
 * Per-route error.tsx files all share this layout — only the `route` prop
 * differs. Keeps copy-paste at the route boundary to a few lines.
 *
 * `error.digest` is Next.js's identifier for server-side error correlation
 * — show it so operators can grep server logs.
 */
export function RouteError({ error, reset, route }: Props) {
  return (
    <div
      role="alert"
      className="flex h-full w-full flex-col items-center justify-center gap-4 p-8"
    >
      <AlertOctagon size={32} className="text-red" />
      <div className="text-center">
        <h2 className="text-base font-bold">{route} crashed</h2>
        <p className="text-xs text-txt-tertiary mt-1">
          This page hit an unrecoverable error. The rest of the dashboard should
          still work — try reloading this view.
        </p>
      </div>

      <pre className="panel-inset max-w-2xl px-4 py-3 font-mono text-[11px] text-red whitespace-pre-wrap break-words">
        {error.message}
      </pre>

      {error.digest && (
        <p className="font-mono text-[10px] text-txt-muted">
          digest: {error.digest}
        </p>
      )}

      <MollyButton onClick={reset}>
        <RotateCcw size={13} /> Reload {route}
      </MollyButton>
    </div>
  );
}
