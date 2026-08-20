import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { toastStore, type Toast } from '../../utils/toast';
import clsx from 'clsx';

const icons = {
  success: <CheckCircle size={15} className="text-green-600 shrink-0" />,
  error:   <AlertCircle size={15} className="text-red-600 shrink-0" />,
  warning: <AlertTriangle size={15} className="text-amber-600 shrink-0" />,
  info:    <Info size={15} className="text-teal-600 shrink-0" />,
};

const styles = {
  success: 'border-green-200 bg-green-50',
  error:   'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info:    'border-teal-200 bg-teal-50',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>(() => toastStore.getToasts());

  useEffect(() => {
    const unsub = toastStore.subscribe(setToasts);
    return () => { unsub(); };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'flex items-start gap-2.5 px-3 py-2.5 border rounded shadow-sm text-sm pointer-events-auto',
            styles[t.type]
          )}
        >
          {icons[t.type]}
          <span className="flex-1 text-slate-800">{t.message}</span>
          <button
            onClick={() => toastStore.dismiss(t.id)}
            className="text-slate-400 hover:text-slate-600 shrink-0"
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
