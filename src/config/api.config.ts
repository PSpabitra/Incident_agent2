/**
 * API configuration. Endpoint paths are kept here (not in components)
 * so renaming a backend route is a one-line change.
 */
export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30_000,
  retry: { attempts: 3, delayMs: 800 },
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      me: '/auth/me',
    },
    incidents: {
      list: '/incidents',
      detail: (id: string) => `/incidents/${id}`,
      create: '/incidents',
      update: (id: string) => `/incidents/${id}`,
      ingest: '/incidents/ingest',
      triage: (id: string) => `/incidents/${id}/triage`,
      resolve: (id: string) => `/incidents/${id}/resolve`,
      escalate: (id: string) => `/incidents/${id}/escalate`,
      timeline: (id: string) => `/incidents/${id}/timeline`,
    },
    runbooks: {
      list: '/runbooks',
      detail: (id: string) => `/runbooks/${id}`,
      create: '/runbooks',
      update: (id: string) => `/runbooks/${id}`,
      delete: (id: string) => `/runbooks/${id}`,
      execute: (id: string) => `/runbooks/${id}/execute`,
      upload: '/runbooks/upload',
    },
    knowledgeBase: {
      list: '/kb',
      detail: (id: string) => `/kb/${id}`,
      search: '/kb/search',
      create: '/kb',
      update: (id: string) => `/kb/${id}`,
      delete: (id: string) => `/kb/${id}`,
      upload: '/kb/upload',
    },
    escalations: {
      list: '/escalations',
      detail: (id: string) => `/escalations/${id}`,
      assign: (id: string) => `/escalations/${id}/assign`,
      resolve: (id: string) => `/escalations/${id}/resolve`,
    },
    dashboard: {
      metrics: '/dashboard/metrics',
      timeseries: '/dashboard/timeseries',
      heatmap: '/dashboard/heatmap',
    },
    actions: {
      list: '/actions',
    },
  },
} as const;

export type ApiConfig = typeof apiConfig;
