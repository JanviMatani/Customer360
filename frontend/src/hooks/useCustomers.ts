import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../lib/api';

export function useCustomers(params?: {
  search?: string;
  sourceSystem?: string;
  segment?: string;
  hasOpportunity?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersApi.list(params),
    staleTime: 30000,
  });
}

export function useCustomer(goldenId?: string) {
  return useQuery({
    queryKey: ['customer', goldenId],
    queryFn: () => (goldenId ? customersApi.getById(goldenId) : null),
    enabled: !!goldenId,
    staleTime: 30000,
  });
}

export function useCustomerOpportunities(goldenId?: string) {
  return useQuery({
    queryKey: ['customer-opportunities', goldenId],
    queryFn: () => (goldenId ? customersApi.getOpportunities(goldenId) : []),
    enabled: !!goldenId,
    staleTime: 30000,
  });
}

export function useOverrideConflict() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      goldenId,
      ...data
    }: {
      goldenId: string;
      field: string;
      selectedValue: string;
      selectedSource: string;
      reason: string;
    }) => customersApi.overrideConflict(goldenId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.goldenId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['audit'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
