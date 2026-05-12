/**
 * Theme metadata used by the ThemeContext and the Header's
 * ThemeToggle component. The actual color values live in tokens.css
 * — this file only describes the available modes.
 */
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeOption {
  id: ThemeMode;
  label: string;
  description: string;
  icon: 'sun' | 'moon' | 'monitor';
}

export const themeOptions: ThemeOption[] = [
  { id: 'light', label: 'Light', description: 'Always light', icon: 'sun' },
  { id: 'dark', label: 'Dark', description: 'Always dark', icon: 'moon' },
  { id: 'system', label: 'System', description: 'Follow OS preference', icon: 'monitor' },
];

export const themeConfig = {
  default: 'system' as ThemeMode,
  storageKey: 'iia-theme',
} as const;
