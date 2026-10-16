"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// `size` clashes with the native HTML input `size` attribute (which is a number),
// so we omit it from the base props and expose our own `inputSize` prop instead.
type Props = Omit<ComponentProps<typeof BaseInput>, "size"> & {
  /** Visual size — affects padding/font, not character width */
  inputSize?: "sm" | "md";
  /** Visual error state — adds red border */
  invalid?: boolean;
};

/**
 * Single-line text input with Molly styling.
 *
 * Drop-in replacement for `<input className="input-base" />`. Built on
 * Base UI's Input primitive for ARIA + form integration.
 */
export function MollyInput({
  className,
  inputSize = "md",
  invalid,
  type = "text",
  ...rest
}: Props) {
  return (
    <BaseInput
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        "font-mono bg-mol-primary border text-txt-primary outline-none transition-colors",
        "placeholder:text-txt-muted",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:border-cyan",
        invalid
          ? "border-red focus:border-red"
          : "border-border-subtle hover:border-border",
        inputSize === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm",
        className,
      )}
      {...rest}
    />
  );
}
