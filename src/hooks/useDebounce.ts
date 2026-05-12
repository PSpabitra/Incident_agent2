import { useEffect, useState } from 'react';

/**
 * useDebounce — returns a value that updates only after `delay` ms of stillness.
 * Used by search inputs to avoid hammering the API on every keystroke.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}
