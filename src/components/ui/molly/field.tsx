"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  /** Visible label text */
  label: string;
  /** Forwarded to <label htmlFor=> — must match the control's id */
  htmlFor: string;
  /** Optional caption shown below the label */
  hint?: string;
  /** Optional error message — replaces hint when present */
  error?: string;
  /** Renders an asterisk on the label */
  required?: boolean;
  /** The form control */
  children: ReactNode;
  className?: string;
}

/**
 * Standard label + control wrapper used across all Molly forms.
 *
 * Replaces the ad-hoc <div><label>...<input/></div> pattern repeated in
 * Settings and Mapping pages. Provides consistent label typography, optional
 * hint text, and visual error state.
 */
export function MollyField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={htmlFor} className="label flex items-center gap-1">
        {label}
        {required && <span className="text-red">*</span>}
      </label>

      {children}

      {(hint || error) && (
        <span
          className={cn(
            "text-[10px] font-mono mt-0.5",
            error ? "text-red" : "text-txt-muted",
          )}
        >
          {error ?? hint}
        </span>
      )}
    </div>
  );
}
