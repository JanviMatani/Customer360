import { useQuery } from '@tanstack/react-query';
import { auditApi, dashboardApi } from '../lib/api';

export function useAuditLogs(params?: {
  action?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['audit', params],
    queryFn: () => auditApi.list(params),
    staleTime: 10000,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => dashboardApi.getStats(),
    staleTime: 15000,
  });
}
