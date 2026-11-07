import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  icon: ReactNode;
  title: string;
  /** Text color class of the icon (e.g. "text-cyan", "text-violet") */
  iconColor?: string;
  children: ReactNode;
  className?: string;
}

/** A card of the Settings page. */
export function SettingsSection({
  icon,
  title,
  iconColor = "text-brand",
  children,
  className,
}: Props) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border-subtle bg-mol-secondary p-5 shadow-card",
        className,
      )}
    >
      <header className="mb-4 flex items-center gap-2.5">
        <span
          aria-hidden
          className={cn(
            "grid size-9 place-items-center rounded-xl bg-mol-tertiary [&>svg]:size-[1.1rem]",
            iconColor,
          )}
        >
          {icon}
        </span>
        <h3 className="text-[0.95rem] font-bold">{title}</h3>
      </header>

      <div>{children}</div>
    </section>
  );
}
