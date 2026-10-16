"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { type Toast, useToastStore } from "./toast-store";

const KIND_STYLES = {
  info: {
    icon: Info,
    border: "border-l-cyan",
    iconClass: "text-cyan",
  },
  success: {
    icon: CheckCircle2,
    border: "border-l-green",
    iconClass: "text-green",
  },
  warn: {
    icon: AlertTriangle,
    border: "border-l-amber",
    iconClass: "text-amber",
  },
  error: {
    icon: XCircle,
    border: "border-l-red",
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
        "panel border-l-2 px-3 py-2.5 pr-8 relative flex gap-2",
        "motion-safe:animate-fade-in",
        "w-80",
        style.border,
      )}
    >
      <Icon size={14} className={cn("shrink-0 mt-0.5", style.iconClass)} />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-txt-primary truncate">{toast.title}</div>
        {toast.description && (
          <div className="text-[10px] text-txt-tertiary mt-0.5 break-words">
            {toast.description}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
        className="absolute top-1.5 right-1.5 text-txt-muted hover:text-txt-primary p-1"
      >
        <X size={11} />
      </button>
    </div>
  );
}
