import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Class-name merger.
 * Combines clsx (conditional classes) with tailwind-merge (de-duplicates
 * conflicting Tailwind utilities, e.g. `px-2 px-4` becomes just `px-4`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
