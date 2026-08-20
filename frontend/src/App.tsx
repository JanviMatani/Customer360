import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomerListPage } from './pages/CustomerListPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { ConfigurationPage } from './pages/ConfigurationPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { UserRole } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Role-based route guard — redirects to /unauthorized if role not allowed
interface RoleRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { user } = useAuthStore();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};

export function App() {
  const { user } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="customers" element={<CustomerListPage />} />
            <Route path="customers/:goldenId" element={<CustomerProfilePage />} />

            {/* Review Queue — Manager and Admin only. RM is blocked at route level. */}
            <Route
              path="review"
              element={
                <RoleRoute allowedRoles={['manager', 'admin']}>
                  <ReviewQueuePage />
                </RoleRoute>
              }
            />

            <Route path="opportunities" element={<OpportunitiesPage />} />
            <Route path="audit" element={<AuditLogPage />} />
            <Route path="config" element={<ConfigurationPage />} />
            <Route path="unauthorized" element={<UnauthorizedPage />} />
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
