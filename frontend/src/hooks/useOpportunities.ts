import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { opportunitiesApi } from '../lib/api';
import { Opportunity } from '../types';

export function useOpportunities(params?: {
  rmId?: string;
  status?: string;
  product?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['opportunities', params],
    queryFn: () => opportunitiesApi.list(params),
    staleTime: 30000,
  });
}

export function useUpdateOpportunityStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Opportunity['status'] }) =>
      opportunitiesApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['customer-opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['audit'] });
    },
  });
}
