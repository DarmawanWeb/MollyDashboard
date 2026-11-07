import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  icon: ReactNode;
  title: string;
  /** Tailwind color class for the icon (e.g. "text-cyan", "text-violet") */
  iconColor?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Standard panel wrapper for each Settings section.
 *
 * Replaces the inline <Section> component duplicated in settings/page.tsx
 * and the older _components/section.tsx.
 */
export function SettingsSection({
  icon,
  title,
  iconColor = "text-cyan",
  children,
  className,
}: Props) {
  return (
    <section className={cn("panel p-5", className)}>
      <header className="flex items-center gap-2.5 mb-4">
        <span className={iconColor}>{icon}</span>
        <h3 className="text-sm font-bold">{title}</h3>
      </header>

      <div>{children}</div>
    </section>
  );
}
