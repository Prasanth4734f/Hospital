import React from 'react';
import { useNotificationContext } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toasts, removeToast } = useNotificationContext();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  const getBorder = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-emerald-500';
      case 'error':
        return 'border-l-4 border-l-rose-500';
      case 'warning':
        return 'border-l-4 border-l-amber-500';
      default:
        return 'border-l-4 border-l-sky-500';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto bg-white rounded-lg shadow-lg border border-slate-100 p-4 flex items-start gap-3 transition-all duration-200 transform translate-y-0 ${getBorder(
            toast.type
          )}`}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
          <div className="flex-1 text-sm font-medium text-slate-800">
            {toast.message}
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;

