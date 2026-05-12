import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'critical'
  | 'high'
  | 'info'
  | 'muted'
  | 'outline';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary border border-primary/20',
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-success/10 text-success border border-success/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  critical: 'bg-critical/10 text-critical border border-critical/20',
  high: 'bg-high/10 text-high border border-high/20',
  info: 'bg-info/10 text-info border border-info/20',
  muted: 'bg-muted text-muted-foreground border border-border',
  outline: 'border border-border text-foreground',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'default', dot = false, className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        'whitespace-nowrap',
        variantStyles[variant],
        className,
      )}
      {...rest}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
});
