"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useHydrated } from "@/hooks/use-hydrated";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/types";

/** One button that flips light ↔ dark. */
export function ThemeToggle({
  className,
  label,
}: {
  className?: string;
  /** Accessible name, e.g. in the display's language */
  label?: string;
}) {
  const { resolved, toggle } = useTheme();
  const hydrated = useHydrated();
  const dark = !hydrated || resolved === "dark";
  const name = label ?? (dark ? "Switch to light mode" : "Switch to dark mode");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={name}
      title={name}
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center rounded-full",
        "border border-border-subtle bg-mol-secondary text-txt-secondary",
        "transition-colors hover:text-txt-primary hover:border-border",
        className,
      )}
    >
      <Sun
        aria-hidden
        className={cn(
          "absolute size-[45%] transition-all duration-300",
          dark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0",
        )}
      />
      <Moon
        aria-hidden
        className={cn(
          "absolute size-[45%] transition-all duration-300",
          dark ? "scale-100 rotate-0" : "scale-0 rotate-90 opacity-0",
        )}
      />
    </button>
  );
}

const OPTIONS: ReadonlyArray<{
  mode: ThemeMode;
  label: string;
  icon: typeof Sun;
}> = [
  { mode: "light", label: "Light", icon: Sun },
  { mode: "dark", label: "Dark", icon: Moon },
  { mode: "system", label: "System", icon: Monitor },
];

/** Light / Dark / System as a segmented control (Settings). */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();
  const hydrated = useHydrated();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "inline-flex rounded-xl border border-border-subtle bg-mol-tertiary p-1",
        className,
      )}
    >
      {OPTIONS.map(({ mode: value, label, icon: Icon }) => {
        const active = hydrated && mode === value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: a styled segmented control, not a native radio
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setMode(value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "bg-mol-secondary text-txt-primary shadow-card"
                : "text-txt-tertiary hover:text-txt-primary",
            )}
          >
            <Icon size={13} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
