import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A rounded card of the visitor display, with an optional title row. */
export function DisplayCard({
  title,
  icon,
  aside,
  className,
  bodyClassName,
  children,
}: {
  title?: ReactNode;
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
        "display-card flex min-h-0 min-w-0 flex-col overflow-hidden",
        className,
      )}
    >
      {title && (
        <header className="flex shrink-0 items-center justify-between gap-3 px-5 pt-4 pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && (
              <span
                aria-hidden
                className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand/12 text-brand [&>svg]:size-4"
              >
                {icon}
              </span>
            )}
            <h2 className="truncate text-[1.05rem] font-bold tracking-tight">
              {title}
            </h2>
          </div>
          {aside}
        </header>
      )}
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Small rounded label (status, place, counts). */
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
        "inline-flex max-w-full items-center gap-1.5 truncate rounded-full border border-border-subtle bg-mol-tertiary px-2.5 py-1 text-xs font-semibold text-txt-secondary",
        className,
      )}
    >
      {children}
    </span>
  );
}
