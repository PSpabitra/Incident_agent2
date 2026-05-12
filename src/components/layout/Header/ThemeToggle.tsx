import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { themeOptions } from '@/config/theme.config';
import { cn } from '@/utils/cn';

const iconMap = { sun: Sun, moon: Moon, monitor: Monitor } as const;

export function ThemeToggle() {
  const { mode, setMode, resolved } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const ActiveIcon = resolved === 'dark' ? Moon : Sun;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md',
          'text-muted-foreground hover:text-foreground hover:bg-surface-hover',
          'transition-colors',
        )}
      >
        <ActiveIcon className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-border bg-surface shadow-soft-lg p-1 z-40"
          >
            {themeOptions.map((opt) => {
              const Icon = iconMap[opt.icon];
              const active = mode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setMode(opt.id);
                    setOpen(false);
                  }}
                  role="menuitemradio"
                  aria-checked={active}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm',
                    'text-foreground hover:bg-surface-hover transition-colors',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {opt.label}
                  </span>
                  {active && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
