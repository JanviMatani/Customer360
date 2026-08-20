import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { configApi } from '../lib/api';
import { MatchConfig, OpportunityRule } from '../types';

export function useConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: () => configApi.get(),
    staleTime: 10000,
  });
}

export function useUpdateMatchConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      weights?: MatchConfig['weights'];
      autoMergeThreshold?: number;
      manualReviewThreshold?: number;
    }) => configApi.updateMatchConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['audit'] });
    },
  });
}

export function useUpdateOpportunityRules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rules: OpportunityRule[]) => configApi.updateOpportunityRules(rules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['audit'] });
    },
  });
}
