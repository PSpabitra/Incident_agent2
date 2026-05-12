import { create } from 'zustand';
import type { Incident } from '@/types';

interface IncidentSlice {
  /** Currently selected incident detail page (mostly for keeping side-panel context). */
  selectedId: string | null;
  /** Filter state controlling the queue listing. */
  filters: {
    status: string[];
    priority: string[];
    search: string;
  };
  /** Optimistic local cache; React Query handles authoritative server state. */
  optimisticPatches: Record<string, Partial<Incident>>;
  setSelectedId: (id: string | null) => void;
  setStatusFilter: (status: string[]) => void;
  setPriorityFilter: (priority: string[]) => void;
  setSearch: (q: string) => void;
  resetFilters: () => void;
  applyOptimistic: (id: string, patch: Partial<Incident>) => void;
  clearOptimistic: (id: string) => void;
}

const initialFilters = { status: [], priority: [], search: '' };

export const useIncidentSlice = create<IncidentSlice>((set) => ({
  selectedId: null,
  filters: initialFilters,
  optimisticPatches: {},
  setSelectedId: (id) => set({ selectedId: id }),
  setStatusFilter: (status) =>
    set((state) => ({ filters: { ...state.filters, status } })),
  setPriorityFilter: (priority) =>
    set((state) => ({ filters: { ...state.filters, priority } })),
  setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } })),
  resetFilters: () => set({ filters: initialFilters }),
  applyOptimistic: (id, patch) =>
    set((state) => ({
      optimisticPatches: { ...state.optimisticPatches, [id]: { ...state.optimisticPatches[id], ...patch } },
    })),
  clearOptimistic: (id) =>
    set((state) => {
      const next = { ...state.optimisticPatches };
      delete next[id];
      return { optimisticPatches: next };
    }),
}));
