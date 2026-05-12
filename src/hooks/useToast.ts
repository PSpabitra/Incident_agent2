import { create } from 'zustand';
import type { Toast, ToastVariant } from '@/types';

interface ToastStore {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/**
 * useToast — imperatively push a toast notification anywhere in the tree.
 * Render the <Toaster /> component once near the root to display them.
 */
export function useToast() {
  const push = useToastStore((s) => s.push);
  const dismiss = useToastStore((s) => s.dismiss);

  return {
    toast: (title: string, opts?: { description?: string; variant?: ToastVariant; duration?: number }) =>
      push({
        title,
        description: opts?.description,
        variant: opts?.variant ?? 'info',
        duration: opts?.duration ?? 4000,
      }),
    success: (title: string, description?: string) =>
      push({ title, description, variant: 'success', duration: 3500 }),
    error: (title: string, description?: string) =>
      push({ title, description, variant: 'error', duration: 5000 }),
    warning: (title: string, description?: string) =>
      push({ title, description, variant: 'warning', duration: 4000 }),
    dismiss,
  };
}

export const useToasts = () => useToastStore((s) => s.toasts);
export const useToastDismiss = () => useToastStore((s) => s.dismiss);
