/**
 * Application-wide configuration.
 * Centralises env-driven values so components never read import.meta.env directly.
 */
export const appConfig = {
  name: import.meta.env.VITE_APP_NAME || 'Intelligent Incident Agent',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  defaultTheme: (import.meta.env.VITE_DEFAULT_THEME || 'system') as 'light' | 'dark' | 'system',
  features: {
    mockApi: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
  routes: {
    welcome: '/welcome',
    login: '/login',
    dashboard: '/dashboard',
    incidents: '/incidents',
    incidentDetails: (id: string) => `/incidents/${id}`,
    runbooks: '/runbooks',
    knowledgeBase: '/knowledge-base',
    escalations: '/escalations',
    actions: '/actions',
    settings: '/settings',
  },
  storage: {
    themeKey: 'iia-theme',
    authKey: 'iia-auth',
    refreshKey: 'iia-refresh',
  },
} as const;

export type AppConfig = typeof appConfig;
