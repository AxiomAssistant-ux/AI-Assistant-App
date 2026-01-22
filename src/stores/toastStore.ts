import { create } from 'zustand';
import { Toast, ToastType } from '../lib/types';

interface ToastState {
  toasts: Toast[];

  // Actions
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  showToast: (type: ToastType, message: string, duration = 3000) => {
    const id = `toast_${++toastIdCounter}`;
    const toast: Toast = { id, type, message, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        get().hideToast(id);
      }, duration);
    }
  },

  hideToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },
}));

// Convenience functions
export const showSuccess = (message: string) => useToastStore.getState().showToast('success', message);
export const showError = (message: string) => useToastStore.getState().showToast('error', message);
export const showWarning = (message: string) => useToastStore.getState().showToast('warning', message);
export const showInfo = (message: string) => useToastStore.getState().showToast('info', message);

export default useToastStore;
