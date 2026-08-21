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

export function useOpportunityExplain(goldenId: string) {
  return useQuery({
    queryKey: ['opportunity-explain', goldenId],
    queryFn: () => opportunitiesApi.explainOpportunity(goldenId),
    staleTime: 60000,
    enabled: !!goldenId,
    retry: false,           // don't retry on 404/500 — backend may not have this data yet
    throwOnError: false,    // never crash the page if this optional call fails
  });
}
