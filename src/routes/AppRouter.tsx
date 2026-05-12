import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routesConfig } from './routes.config';
import { PrivateRoute } from './PrivateRoute';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

const NotFound = lazy(() => import('@/pages/NotFound'));

export function AppRouter() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSpinner label="Loading…" />}>
        <Routes>
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          {routesConfig.map(({ path, Component, isPublic, roles }) => (
            <Route
              key={path}
              path={path}
              element={
                isPublic ? (
                  <Component />
                ) : (
                  <PrivateRoute roles={roles}>
                    <Component />
                  </PrivateRoute>
                )
              }
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
