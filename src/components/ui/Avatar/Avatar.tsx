import { cn } from '@/utils/cn';
import { initialsOf } from '@/utils/formatters';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold shrink-0',
        sizeStyles[size],
        className,
      )}
      aria-label={name}
      title={name}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span>{initialsOf(name)}</span>
      )}
    </div>
  );
}
