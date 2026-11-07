import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatProps {
  icon?: ReactNode;
  label: string;
  value: string;
  /** Tailwind text color class for the value */
  tone?: string;
  hint?: string;
}

/** One labelled value in the robot status grids. */
export function Stat({ icon, label, value, tone, hint }: StatProps) {
  return (
    <div className="min-w-0 rounded-lg bg-mol-tertiary px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-txt-tertiary">
        {icon && (
          <span aria-hidden className="shrink-0">
            {icon}
          </span>
        )}
        <span className="truncate text-[11px] font-medium">{label}</span>
      </div>
      <div
        className={cn(
          "truncate text-sm font-semibold tabular-nums",
          tone ?? "text-txt-primary",
        )}
        title={hint ?? value}
      >
        {value}
      </div>
    </div>
  );
}
