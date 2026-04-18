import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/lib/auth-context';
import type { SessionUser } from '@/lib/types';

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white/70">
      Loading...
    </div>
  );
}

function isAdminUser(user: SessionUser | null) {
  return user?.role === 'admin' || user?.role === 'super_admin';
}

export function RequireAuth() {
  const location = useLocation();
  const { status, user } = useAuth();

  if (status === 'loading') {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdminUser(user) && !user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return <FullScreenLoader />;
  }

  if (user) {
    if (isAdminUser(user)) {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to={user.onboardingCompleted ? '/dashboard' : '/onboarding'} replace />;
  }

  return <Outlet />;
}

export function RequireAdmin() {
  const location = useLocation();
  const { status, user } = useAuth();

  if (status === 'loading') {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdminUser(user)) {
    return <Navigate to={user.onboardingCompleted ? '/dashboard' : '/onboarding'} replace />;
  }

  return <Outlet />;
}

export function AdminPublicOnlyRoute() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return <FullScreenLoader />;
  }

  if (isAdminUser(user)) {
    return <Navigate to="/admin" replace />;
  }

  if (user) {
    return <Navigate to={user.onboardingCompleted ? '/dashboard' : '/onboarding'} replace />;
  }

  return <Outlet />;
}
