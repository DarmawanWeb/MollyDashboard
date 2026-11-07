"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
 * Variants
 *
 * Mirrors the .btn / .btn-primary / .btn-ghost / .btn-danger utility classes
 * from globals.css so both styles render identically. Prefer using <MollyButton>
 * for typed variants; the .btn utility classes remain for places where a plain
 * <button> element makes more sense (e.g. icon-only toolbar buttons).
 * ------------------------------------------------------------------------- */

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-1.5",
    "rounded-lg font-medium",
    "border cursor-pointer transition-colors outline-none",
    "focus-visible:ring-2 focus-visible:ring-brand/30",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ),
  {
    variants: {
      variant: {
        primary: cn(
          "bg-brand text-on-brand border-brand",
          "hover:bg-brand-light hover:border-brand-light",
          "disabled:bg-mol-tertiary disabled:text-txt-muted disabled:border-border-subtle disabled:opacity-100",
        ),
        ghost: cn(
          "bg-mol-secondary text-txt-secondary border-border",
          "hover:bg-mol-tertiary hover:text-txt-primary",
        ),
        danger: cn(
          "bg-mol-secondary text-red border-border",
          "hover:border-red/40 hover:bg-red/5",
        ),
        secondary: cn(
          "bg-mol-tertiary text-txt-primary border-transparent",
          "hover:bg-mol-elevated",
        ),
      },
      size: {
        xs: "px-2 py-1 text-[11px]",
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-xs",
        lg: "px-5 py-2.5 text-sm",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

/* ----------------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------------- */

type Props = ComponentProps<typeof BaseButton> &
  VariantProps<typeof buttonVariants>;

/**
 * Molly button with industrial styling.
 *
 * Drop-in replacement for the shadcn <Button>. Built on @base-ui/react Button
 * for ARIA semantics + native button behavior (proper form submit, keyboard
 * activation, etc.).
 *
 * Usage:
 *   <MollyButton onClick={start}>
 *     <Play size={14} /> Start tour
 *   </MollyButton>
 *
 *   <MollyButton variant="danger" size="sm">
 *     <Square size={12} /> Stop
 *   </MollyButton>
 */
export function MollyButton({
  className,
  variant,
  size,
  fullWidth,
  ...rest
}: Props) {
  return (
    <BaseButton
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...rest}
    />
  );
}
