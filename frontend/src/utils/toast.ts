// Lightweight toast system — no external dependency
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

export const toastStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  getToasts: () => [...toasts],
  show(message: string, type: ToastType = 'info', duration = 3500) {
    const id = Math.random().toString(36).slice(2);
    toasts = [...toasts, { id, message, type }];
    notify();
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      notify();
    }, duration);
  },
  success: (msg: string) => toastStore.show(msg, 'success'),
  error:   (msg: string) => toastStore.show(msg, 'error', 5000),
  info:    (msg: string) => toastStore.show(msg, 'info'),
  warning: (msg: string) => toastStore.show(msg, 'warning'),
  dismiss(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
};

export type { Toast, ToastType };
