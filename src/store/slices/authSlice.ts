import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthSlice {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (user: User, access: string, refresh: string) => void;
  clearSession: () => void;
  setUser: (user: User) => void;
}

/**
 * Persisted auth slice. AuthContext is the public API the app uses;
 * this slice exists so non-React modules (e.g. websocket clients)
 * can read tokens without prop drilling.
 */
export const useAuthSlice = create<AuthSlice>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: (user, access, refresh) =>
        set({ user, accessToken: access, refreshToken: refresh }),
      clearSession: () => set({ user: null, accessToken: null, refreshToken: null }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'iia-auth-slice',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
