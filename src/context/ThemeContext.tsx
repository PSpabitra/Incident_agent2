import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { themeConfig, type ResolvedTheme, type ThemeMode } from '@/config/theme.config';

interface ThemeContextValue {
  /** User's selected mode (light | dark | system). */
  mode: ThemeMode;
  /** Final theme actually applied (system resolves to light or dark). */
  resolved: ResolvedTheme;
  /** Update the user's selection. */
  setMode: (mode: ThemeMode) => void;
  /** Convenience toggle: light -> dark -> system -> light. */
  cycle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const getSystemTheme = (): ResolvedTheme =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

const applyTheme = (theme: ResolvedTheme) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0F172A' : '#FFFFFF');
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const stored = window.localStorage.getItem(themeConfig.storageKey) as ThemeMode | null;
      return stored ?? themeConfig.default;
    } catch {
      return themeConfig.default;
    }
  });

  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    mode === 'system' ? getSystemTheme() : mode,
  );

  // Re-resolve when mode changes
  useEffect(() => {
    const next = mode === 'system' ? getSystemTheme() : mode;
    setResolved(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(themeConfig.storageKey, mode);
    } catch {
      /* noop */
    }
  }, [mode]);

  // React to OS preference changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const next = e.matches ? 'dark' : 'light';
      setResolved(next);
      applyTheme(next);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => setModeState(next), []);

  const cycle = useCallback(() => {
    setModeState((prev) =>
      prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light',
    );
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolved, setMode, cycle }),
    [mode, resolved, setMode, cycle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
