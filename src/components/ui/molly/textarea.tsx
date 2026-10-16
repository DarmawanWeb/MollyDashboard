"use client";

import { type ComponentProps, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentProps<"textarea"> & {
  /**
   * Visual size — affects padding/font, not character width.
   * Named `textareaSize` to mirror MollyInput's `inputSize`.
   */
  textareaSize?: "sm" | "md";
  /** Visual error state — adds red border */
  invalid?: boolean;
};

/**
 * Multi-line text input. Base UI doesn't ship a Textarea primitive so this
 * uses native <textarea> with matching styling.
 *
 * Uses forwardRef so callers can attach refs for imperative focus etc.
 */
export const MollyTextarea = forwardRef<HTMLTextAreaElement, Props>(
  function MollyTextarea(
    { className, textareaSize = "md", invalid, rows = 3, ...rest },
    ref,
  ) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "font-mono bg-mol-primary border text-txt-primary outline-none transition-colors resize-y min-h-16",
          "placeholder:text-txt-muted",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:border-cyan",
          invalid
            ? "border-red focus:border-red"
            : "border-border-subtle hover:border-border",
          textareaSize === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm",
          className,
        )}
        {...rest}
      />
    );
  },
);
