"use client";

import { useToastStore } from "@/stores/use-toast-store";
import { ToastItem } from "./toast";

/**
 * Fixed-position container for active toasts.
 *
 * Mounted once by the app shell. Toasts
 * stack from bottom-right; newest appears on top. Container is
 * pointer-events-none so it doesn't block clicks on the dashboard, but
 * individual toasts re-enable pointer-events so dismiss buttons work.
 */
export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 bottom-14 z-50 flex flex-col-reverse gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
