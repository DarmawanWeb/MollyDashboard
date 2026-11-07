import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A card of the operator pages: icon, title, optional actions on the right,
 * then the content.
 */
export function AppSection({
  title,
  icon,
  aside,
  className,
  bodyClassName,
  children,
}: {
  title: string;
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
        "flex min-h-0 flex-col rounded-xl border border-border-subtle bg-mol-secondary p-4 shadow-card",
        className,
      )}
    >
      <header className="mb-3 flex min-h-7 shrink-0 items-center gap-2">
        {icon && (
          <span
            aria-hidden
            className="shrink-0 text-txt-tertiary [&>svg]:size-4"
          >
            {icon}
          </span>
        )}
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">
          {title}
        </h3>
        {aside}
      </header>

      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}
