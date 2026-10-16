"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------- */

export interface MollySelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
  /** Optional secondary text shown right-aligned (e.g. shortcut, count) */
  hint?: string;
  /** Optional leading icon */
  icon?: ReactNode;
  disabled?: boolean;
}

interface Props<TValue extends string> {
  id?: string;
  value: TValue;
  onChange: (value: TValue) => void;
  options: ReadonlyArray<MollySelectOption<TValue>>;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: "sm" | "md";
  className?: string;
  /** aria-label for the trigger when there's no visible label nearby */
  ariaLabel?: string;
  /** Max popup height in px. Default 280. */
  maxPopupHeight?: number;
}

/* ----------------------------------------------------------------------------
 * MollySelect — typed wrapper around Base UI Select with dark popup styling
 *
 * Replaces native <select> in Settings and Mapping pages. Native select
 * dropdowns can't be styled (browser-controlled popup chrome), which is
 * why the previous dark theme looked broken when opened. Base UI renders
 * a fully custom popup that respects our design tokens.
 *
 * Usage:
 *   <MollySelect
 *     value={planner}
 *     onChange={setPlanner}
 *     options={[
 *       { value: "NavFn", label: "NavFn (Dijkstra)" },
 *       { value: "Smac2d", label: "Smac 2D" },
 *     ]}
 *   />
 * ------------------------------------------------------------------------- */

export function MollySelect<TValue extends string = string>({
  id,
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  invalid,
  size = "md",
  className,
  ariaLabel,
  maxPopupHeight = 280,
}: Props<TValue>) {
  const sizeClasses = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm";

  const selected = options.find((o) => o.value === value);

  return (
    <BaseSelect.Root
      value={value}
      onValueChange={(v) => onChange(v as TValue)}
      disabled={disabled}
    >
      <BaseSelect.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className={cn(
          "group/select inline-flex w-full items-center justify-between gap-2",
          "font-mono bg-mol-primary border text-txt-primary outline-none transition-colors",
          "focus:border-cyan",
          "data-popup-open:border-cyan",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          invalid
            ? "border-red focus:border-red data-popup-open:border-red"
            : "border-border-subtle hover:border-border",
          sizeClasses,
          className,
        )}
      >
        <BaseSelect.Value
          className={cn(
            "flex items-center gap-2 truncate min-w-0",
            !selected && "text-txt-muted",
          )}
        >
          {selected ? (
            <>
              {selected.icon && (
                <span className="shrink-0 text-cyan">{selected.icon}</span>
              )}
              <span className="truncate">{selected.label}</span>
            </>
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
        </BaseSelect.Value>

        <BaseSelect.Icon
          render={
            <ChevronDown
              size={size === "sm" ? 12 : 14}
              className="shrink-0 text-txt-tertiary transition-transform group-data-popup-open/select:rotate-180"
            />
          }
        />
      </BaseSelect.Trigger>

      <BaseSelect.Portal>
        <BaseSelect.Positioner
          sideOffset={4}
          alignItemWithTrigger={false}
          className="z-50"
        >
          <BaseSelect.Popup
            className={cn(
              "w-[var(--anchor-width)] min-w-[8rem]",
              "bg-mol-secondary border border-border shadow-xl",
              "font-mono outline-none",
              "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
              "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              "data-[side=top]:slide-in-from-bottom-1",
              "data-[side=bottom]:slide-in-from-top-1",
            )}
            style={{ maxHeight: maxPopupHeight }}
          >
            <BaseSelect.List className="overflow-y-auto py-1 max-h-[inherit]">
              {options.map((opt) => (
                <BaseSelect.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center gap-2",
                    "px-2.5 py-1.5 text-xs text-txt-secondary outline-none transition-colors",
                    "data-highlighted:bg-mol-tertiary data-highlighted:text-txt-primary",
                    "data-selected:text-cyan",
                    "data-disabled:opacity-40 data-disabled:cursor-not-allowed",
                    "data-disabled:hover:bg-transparent",
                  )}
                >
                  {opt.icon && (
                    <span className="shrink-0 text-cyan">{opt.icon}</span>
                  )}

                  <BaseSelect.ItemText className="flex-1 truncate">
                    {opt.label}
                  </BaseSelect.ItemText>

                  {opt.hint && (
                    <span className="shrink-0 text-[10px] text-txt-muted">
                      {opt.hint}
                    </span>
                  )}

                  <BaseSelect.ItemIndicator
                    render={
                      <span className="ml-1 flex w-3 shrink-0 items-center justify-center">
                        <Check size={11} className="text-cyan" />
                      </span>
                    }
                  />
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
