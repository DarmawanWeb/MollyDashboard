import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppSection({
  title,
  icon,
  className,
  children,
}: {
  title: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "border-b border-border-subtle px-2 py-3 flex flex-col min-h-0",
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2 shrink-0">
        {icon && <span className="text-cyan">{icon}</span>}
        <span className="label">{title}</span>
      </div>

      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}
