import { create } from "zustand";

export type ToastKind = "info" | "success" | "warn" | "error";

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  /** Optional secondary line — keep it short, no full stack traces */
  description?: string;
  /** ms before auto-dismiss. 0 or undefined = sticky */
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

/**
 * Global toast notification store.
 *
 * Use via the `toast` helper functions below rather than the hook directly
 * — they're callable from anywhere (non-React contexts too) without needing
 * the React context.
 */
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    return id;
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

/**
 * Imperative API — call from anywhere (React or non-React).
 *
 *   toast.error("Service call failed", "save_map: timeout");
 *   toast.success("Map saved");
 */
export const toast = {
  info: (title: string, description?: string, duration = 4000) =>
    useToastStore
      .getState()
      .push({ kind: "info", title, description, duration }),
  success: (title: string, description?: string, duration = 3000) =>
    useToastStore
      .getState()
      .push({ kind: "success", title, description, duration }),
  warn: (title: string, description?: string, duration = 5000) =>
    useToastStore
      .getState()
      .push({ kind: "warn", title, description, duration }),
  error: (title: string, description?: string, duration = 6000) =>
    useToastStore
      .getState()
      .push({ kind: "error", title, description, duration }),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};
