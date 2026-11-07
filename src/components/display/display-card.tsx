import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A card of the visitor display, with an optional title row. */
export function DisplayCard({
  title,
  subtitle,
  icon,
  aside,
  className,
  bodyClassName,
  children,
}: {
  title?: ReactNode;
  /** Quiet text after the title (the place, the tour's name) */
  subtitle?: ReactNode;
  icon?: ReactNode;
  /** Right side of the title row */
  aside?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "display-card @container/card flex min-h-0 min-w-0 flex-col overflow-hidden",
        className,
      )}
    >
      {title && (
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 px-5 py-3">
          <div className="flex min-w-0 items-center gap-2">
            {icon && (
              <span
                aria-hidden
                className="shrink-0 text-txt-tertiary [&>svg]:size-4"
              >
                {icon}
              </span>
            )}
            <h2 className="truncate text-[0.95rem] font-semibold tracking-tight">
              {title}
              {subtitle && (
                <span className="font-normal text-txt-tertiary">
                  {" "}
                  · {subtitle}
                </span>
              )}
            </h2>
          </div>
          {aside}
        </header>
      )}
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Small label (status, place, counts). */
export function Chip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full shrink-0 items-center gap-1.5 truncate rounded-md bg-mol-tertiary px-2 py-1 text-xs font-medium text-txt-secondary",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A status dot (green running, amber paused, gray idle). */
export function Dot({
  className,
  pulse = false,
}: {
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        pulse && "motion-safe:animate-pulse-dot",
        className,
      )}
    />
  );
}
