import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeStyles = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div className={cn('inline-flex items-center gap-2 text-muted-foreground', className)}>
      <Loader2 className={cn('animate-spin', sizeStyles[size])} aria-hidden />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

interface PageSpinnerProps {
  label?: string;
}

export function PageSpinner({ label = 'Loading…' }: PageSpinnerProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <Spinner size="lg" label={label} />
    </div>
  );
}
