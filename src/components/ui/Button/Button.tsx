import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ButtonProps } from './Button.types';

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-soft-sm',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/95 shadow-soft-sm',
  outline:
    'border border-border bg-transparent text-foreground hover:bg-surface-hover hover:border-primary/40',
  ghost: 'bg-transparent text-foreground hover:bg-surface-hover',
  danger: 'bg-critical text-white hover:bg-critical/90 active:bg-critical/95 shadow-soft-sm',
  success: 'bg-success text-white hover:bg-success/90 active:bg-success/95 shadow-soft-sm',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    disabled,
    children,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || isLoading;
  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        // base
        'inline-flex items-center justify-center font-medium rounded-md',
        'transition-all duration-150 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      {children && <span className="truncate">{children}</span>}
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
});
