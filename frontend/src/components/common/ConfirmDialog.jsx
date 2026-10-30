import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info'
  loading = false,
  confirmId = 'btn_confirm',
  cancelId = 'btn_cancel',
}) => {
  const icons = {
    danger: <AlertOctagon className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    info: <Info className="w-6 h-6 text-teal-600" />,
  };

  const buttonVariants = {
    danger: 'danger',
    warning: 'teal',
    info: 'primary',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button id={cancelId} variant="outline" size="sm" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          id={confirmId}
          variant={buttonVariants[type]}
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

