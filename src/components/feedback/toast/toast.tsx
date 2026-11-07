"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { type Toast, useToastStore } from "@/stores/use-toast-store";

const KIND_STYLES = {
  info: {
    icon: Info,
    iconClass: "text-cyan",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-green",
  },
  warn: {
    icon: AlertTriangle,
    iconClass: "text-amber",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red",
  },
} as const;

interface Props {
  toast: Toast;
}

/**
 * Single toast row. Auto-dismisses after `toast.duration` ms unless 0/undefined.
 *
 * Uses role="status" for transient info/success (polite announcement) and
 * role="alert" for warn/error (assertive — interrupts screen readers).
 */
export function ToastItem({ toast }: Props) {
  const dismiss = useToastStore((s) => s.dismiss);
  const style = KIND_STYLES[toast.kind];
  const Icon = style.icon;

  useEffect(() => {
    if (!toast.duration) return;
    const id = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => clearTimeout(id);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <div
      role={
        toast.kind === "error" || toast.kind === "warn" ? "alert" : "status"
      }
      aria-live={
        toast.kind === "error" || toast.kind === "warn" ? "assertive" : "polite"
      }
      className={cn(
        "relative flex w-80 gap-3 rounded-2xl border border-border-subtle bg-mol-secondary px-3.5 py-3 pr-9 shadow-card-lg",
        "motion-safe:animate-rise-in",
      )}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg bg-mol-tertiary",
          style.iconClass,
        )}
      >
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1 self-center">
        <div className="truncate text-sm font-semibold text-txt-primary">
          {toast.title}
        </div>
        {toast.description && (
          <div className="mt-0.5 break-words text-xs text-txt-tertiary">
            {toast.description}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
        className="absolute top-2 right-2 rounded-md p-1 text-txt-muted hover:bg-mol-tertiary hover:text-txt-primary"
      >
        <X size={13} />
      </button>
    </div>
  );
}
