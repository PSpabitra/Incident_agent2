import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

/**
 * Tiny logger middleware that prints state transitions in dev mode only.
 * Can be applied per-slice with `create<State>()(logger((set) => ({…})))`.
 */
type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string,
) => StateCreator<T, Mps, Mcs>;

type LoggerImpl = <T>(f: StateCreator<T, [], []>, name?: string) => StateCreator<T, [], []>;

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...args) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.groupCollapsed(`[zustand:${name ?? 'store'}] update`);
      // eslint-disable-next-line no-console
      console.log('prev:', get());
    }
    set(...args);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('next:', get());
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  };
  return f(loggedSet, get, store);
};

export const logger = loggerImpl as unknown as Logger;
