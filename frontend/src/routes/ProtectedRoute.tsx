import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../auth/authStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center py-16">
          <p className="text-sm font-medium text-slate-700">Access Restricted</p>
          <p className="text-xs text-slate-400 mt-1">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
