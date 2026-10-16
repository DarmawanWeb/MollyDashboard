"use client";

import { ToastItem } from "./toast";
import { useToastStore } from "./toast-store";

/**
 * Fixed-position container for active toasts.
 *
 * Mount once at the root of the layout (inside DashboardLayout). Toasts
 * stack from bottom-right; newest appears on top. Container is
 * pointer-events-none so it doesn't block clicks on the dashboard, but
 * individual toasts re-enable pointer-events so dismiss buttons work.
 */
export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-10 right-3 z-50 flex flex-col-reverse gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
