import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useToasts, useToastDismiss } from '@/hooks/useToast';
import type { ToastVariant } from '@/types';

const iconMap: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-success/30 bg-surface text-foreground',
  warning: 'border-warning/30 bg-surface text-foreground',
  error: 'border-critical/30 bg-surface text-foreground',
  info: 'border-info/30 bg-surface text-foreground',
};

const iconStyles: Record<ToastVariant, string> = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-critical',
  info: 'text-info',
};

interface ToastItemProps {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

function ToastItem({ id, variant, title, description, duration = 4000 }: ToastItemProps) {
  const dismiss = useToastDismiss();
  const Icon = iconMap[variant];

  useEffect(() => {
    const t = setTimeout(() => dismiss(id), duration);
    return () => clearTimeout(t);
  }, [id, duration, dismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 32, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 32, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-soft-md',
        'min-w-[320px] max-w-md pointer-events-auto',
        variantStyles[variant],
      )}
      role="status"
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconStyles[variant])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(id)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useToasts();
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            id={t.id}
            title={t.title}
            description={t.description}
            variant={t.variant}
            duration={t.duration}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
