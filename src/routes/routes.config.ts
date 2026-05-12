import { lazy, type LazyExoticComponent, type ComponentType } from 'react';
import { appConfig } from '@/config/app.config';

interface RouteDefinition {
  path: string;
  Component: LazyExoticComponent<ComponentType>;
  isPublic: boolean;
  roles?: Array<'admin' | 'engineer' | 'user'>;
}

export const routesConfig: RouteDefinition[] = [
  {
    path: appConfig.routes.welcome,
    Component: lazy(() => import('@/pages/Landing')),
    isPublic: true,
  },
  {
    path: appConfig.routes.login,
    Component: lazy(() => import('@/pages/Login')),
    isPublic: true,
  },
  {
    path: appConfig.routes.dashboard,
    Component: lazy(() => import('@/pages/Dashboard')),
    isPublic: false,
  },
  {
    path: appConfig.routes.incidents,
    Component: lazy(() => import('@/pages/IncidentQueue')),
    isPublic: false,
  },
  {
    path: '/incidents/:id',
    Component: lazy(() => import('@/pages/IncidentDetails')),
    isPublic: false,
  },
  {
    path: appConfig.routes.runbooks,
    Component: lazy(() => import('@/pages/Runbooks')),
    isPublic: false,
  },
  {
    path: appConfig.routes.knowledgeBase,
    Component: lazy(() => import('@/pages/KnowledgeBase')),
    isPublic: false,
  },
  {
    path: '/knowledge-graph',
    Component: lazy(() => import('@/pages/KnowledgeGraph')),
    isPublic: false,
  },
  {
    path: appConfig.routes.escalations,
    Component: lazy(() => import('@/pages/Escalations')),
    isPublic: false,
    roles: ['engineer', 'admin'],
  },
  {
    path: appConfig.routes.actions,
    Component: lazy(() => import('@/pages/AutomatedActions')),
    isPublic: false,
  },
  {
    path: appConfig.routes.settings,
    Component: lazy(() => import('@/pages/Settings')),
    isPublic: false,
  },
  {
    path: '/connectors',
    Component: lazy(() => import('@/pages/Connectors').then((m) => ({ default: m.Connectors }))),
    isPublic: false,
    roles: ['admin'],
  },
  {
    path: '/connectors/:id',
    Component: lazy(() => import('@/pages/Connectors').then((m) => ({ default: m.ConnectorDetail }))),
    isPublic: false,
    roles: ['admin'],
  },
  {
    path: '/connectors/:id/mappings',
    Component: lazy(() => import('@/pages/Connectors').then((m) => ({ default: m.FieldMappings }))),
    isPublic: false,
    roles: ['admin'],
  },
];
