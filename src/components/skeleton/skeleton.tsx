"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  style?: CSSProperties;
}

/**
 * Base shimmer placeholder.
 *
 * Renders a panel-inset rectangle with a subtle animated gradient sweep.
 * Compose into shapes by sizing with Tailwind classes — `h-4 w-24` for a
 * single line of text, `h-full w-full` for a block.
 *
 * Animation respects `prefers-reduced-motion`: when reduced, the gradient
 * stays static so the user isn't subjected to a constantly-moving page.
 */
export function Skeleton({ className, style }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "panel-inset overflow-hidden",
        "before:absolute before:inset-0 before:translate-x-[-100%]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/[0.03] before:to-transparent",
        "motion-safe:before:animate-shimmer",
        "relative",
        className,
      )}
      style={style}
    />
  );
}
