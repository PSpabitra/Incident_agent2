import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageSpinner } from '@/components/ui/Spinner';
import { appConfig } from '@/config/app.config';
import type { UserRole } from '@/types';

interface PrivateRouteProps {
  children: ReactNode;
  /** If supplied, the user must hold one of these roles. */
  roles?: UserRole[];
}

export function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner label="Authenticating…" />;

  if (!isAuthenticated) {
    return <Navigate to={appConfig.routes.login} state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={appConfig.routes.dashboard} replace />;
  }

  return <>{children}</>;
}
