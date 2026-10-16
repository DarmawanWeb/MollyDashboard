"use client";

import { Minus, Plus } from "lucide-react";
import type { ChangeEvent } from "react";
import { cn } from "@/lib/utils";

interface Props {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Decimal places to display/clamp to */
  precision?: number;
  disabled?: boolean;
  invalid?: boolean;
  size?: "sm" | "md";
  className?: string;
  /** Title/aria-label for accessibility */
  title?: string;
}

/**
 * Numeric input with +/- stepper buttons.
 *
 * Better than native <input type="number"> on mobile (no awkward arrow
 * spinners on desktop, no fragile keyboard on mobile) and provides
 * predictable clamping at min/max.
 */
export function MollyNumberInput({
  id,
  value,
  onChange,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  precision = 2,
  disabled,
  invalid,
  size = "md",
  className,
  title,
}: Props) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const round = (n: number) => {
    const f = 10 ** precision;
    return Math.round(n * f) / f;
  };

  const set = (n: number) => {
    if (Number.isNaN(n)) return;
    onChange(round(clamp(n)));
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // allow empty / partial input ("-", ".") without forcing 0
    if (raw === "" || raw === "-" || raw === ".") return;
    const n = Number(raw);
    if (!Number.isNaN(n)) set(n);
  };

  const padding = size === "sm" ? "px-1.5 py-1" : "px-2 py-1.5";
  const fontSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div
      className={cn(
        "flex items-stretch border bg-mol-primary",
        "focus-within:border-cyan transition-colors",
        invalid
          ? "border-red focus-within:border-red"
          : "border-border-subtle hover:border-border",
        disabled && "opacity-50",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => set(value - step)}
        disabled={disabled || value <= min}
        aria-label="Decrement"
        tabIndex={-1}
        className={cn(
          "text-txt-tertiary hover:text-cyan hover:bg-mol-tertiary transition-colors",
          "disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-txt-tertiary",
          "disabled:cursor-not-allowed",
          padding,
          "border-r border-border-subtle",
        )}
      >
        <Minus size={size === "sm" ? 10 : 12} />
      </button>

      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleInput}
        disabled={disabled}
        title={title}
        aria-label={title}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex-1 min-w-0 bg-transparent text-center text-txt-primary font-mono outline-none",
          "disabled:cursor-not-allowed",
          padding,
          fontSize,
        )}
      />

      <button
        type="button"
        onClick={() => set(value + step)}
        disabled={disabled || value >= max}
        aria-label="Increment"
        tabIndex={-1}
        className={cn(
          "text-txt-tertiary hover:text-cyan hover:bg-mol-tertiary transition-colors",
          "disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-txt-tertiary",
          "disabled:cursor-not-allowed",
          padding,
          "border-l border-border-subtle",
        )}
      >
        <Plus size={size === "sm" ? 10 : 12} />
      </button>
    </div>
  );
}
