"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

interface Props {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  size?: "sm" | "md";
}

/**
 * Toggle switch with industrial Molly styling.
 *
 * Use for STT enable, teleop arm, mock-mode override, etc. For binary
 * mutually-exclusive choices among 3+ states, use MollySelect instead.
 */
export function MollySwitch({
  id,
  checked,
  onChange,
  disabled,
  ariaLabel,
  size = "md",
}: Props) {
  const trackW = size === "sm" ? "w-7" : "w-9";
  const trackH = size === "sm" ? "h-4" : "h-5";
  const thumbSize = size === "sm" ? "size-3" : "size-4";
  const thumbTranslate =
    size === "sm" ? "data-checked:translate-x-3" : "data-checked:translate-x-4";

  return (
    <BaseSwitch.Root
      id={id}
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center",
        "border transition-colors outline-none",
        "focus-visible:border-cyan",
        "data-checked:bg-cyan data-checked:border-cyan",
        "data-unchecked:bg-mol-primary data-unchecked:border-border-subtle",
        "data-unchecked:hover:border-border",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        trackW,
        trackH,
      )}
    >
      <BaseSwitch.Thumb
        className={cn(
          "block transition-transform",
          "translate-x-0.5",
          thumbSize,
          thumbTranslate,
          "data-checked:bg-mol-root",
          "data-unchecked:bg-txt-tertiary",
        )}
      />
    </BaseSwitch.Root>
  );
}
