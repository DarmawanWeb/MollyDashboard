"use client";

import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { MollyButton } from "./button";

type Props = Omit<ComponentProps<typeof MollyButton>, "onClick"> & {
  /** Runs on the second click */
  onConfirm: () => void;
  /** Content while armed. Default "Sure?" */
  confirmLabel?: ReactNode;
  /** How long the armed state lasts, ms. Default 3000 */
  timeoutMs?: number;
};

/**
 * Two-step button for destructive actions (delete a POI, a tour): the first
 * click arms it, a second click within a few seconds confirms. Leaving it
 * (blur) or waiting disarms. No modal dialog in the operator's way.
 *
 *   <MollyConfirmButton variant="danger" size="sm" onConfirm={remove}>
 *     <Trash2 size={11} />
 *   </MollyConfirmButton>
 */
export function MollyConfirmButton({
  onConfirm,
  confirmLabel = "Sure?",
  timeoutMs = 3000,
  className,
  children,
  onBlur,
  "aria-label": ariaLabel,
  ...rest
}: Props) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), timeoutMs);
    return () => clearTimeout(timer);
  }, [armed, timeoutMs]);

  return (
    <MollyButton
      {...rest}
      aria-label={
        armed && ariaLabel ? `${ariaLabel}: click again to confirm` : ariaLabel
      }
      onClick={() => {
        if (!armed) {
          setArmed(true);
          return;
        }
        setArmed(false);
        onConfirm();
      }}
      onBlur={(e) => {
        setArmed(false);
        onBlur?.(e);
      }}
      className={cn(
        className,
        armed && "bg-red text-white border-red hover:bg-red/90",
      )}
    >
      {armed ? confirmLabel : children}
    </MollyButton>
  );
}
