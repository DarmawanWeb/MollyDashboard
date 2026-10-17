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
    <div className="panel-inset px-3 py-2">
      <div className="flex items-center gap-1.5 mb-1">
        {icon && (
          <span aria-hidden className="text-txt-muted">
            {icon}
          </span>
        )}
        <span className="label">{label}</span>
      </div>
      <div
        className={cn(
          "font-mono text-sm font-bold truncate",
          tone ?? "text-txt-primary",
        )}
        title={hint ?? value}
      >
        {value}
      </div>
    </div>
  );
}
