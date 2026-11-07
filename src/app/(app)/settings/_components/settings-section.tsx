import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}

/** A card of the Settings page. */
export function SettingsSection({ icon, title, children, className }: Props) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border-subtle bg-mol-secondary p-5 shadow-card",
        className,
      )}
    >
      <header className="mb-4 flex items-center gap-2">
        <span aria-hidden className="text-txt-tertiary [&>svg]:size-4">
          {icon}
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </header>

      <div>{children}</div>
    </section>
  );
}
