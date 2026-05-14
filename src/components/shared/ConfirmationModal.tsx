import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'primary';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  variant = 'danger',
}: ConfirmationModalProps) {
  const variantStyles = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  };

  const iconStyles = {
    danger: 'text-rose-600 bg-rose-50',
    warning: 'text-amber-600 bg-amber-50',
    primary: 'text-blue-600 bg-blue-50',
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center p-2">
        <div className={`p-4 rounded-full mb-4 ${iconStyles[variant]}`}>
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-8 max-w-[280px]">
          {message}
        </p>
        
        <div className="flex flex-col w-full gap-3">
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            className={`w-full h-11 font-bold tracking-widest text-[11px] ${variantStyles[variant]}`}
          >
            {confirmLabel.toUpperCase()}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full h-11 font-bold tracking-widest text-[11px] text-slate-400 border-slate-200"
          >
            {cancelLabel.toUpperCase()}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
