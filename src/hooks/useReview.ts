import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../lib/api';

export function useReviewQueue(status: 'pending' | 'approved' | 'rejected' | 'all' = 'pending') {
  return useQuery({
    queryKey: ['reviewQueue', status],
    queryFn: () => reviewApi.list(status),
    staleTime: 30000,
  });
}

export function useDecideReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, note }: { id: string; decision: 'approved' | 'rejected'; note?: string }) =>
      reviewApi.decide(id, decision, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['audit'] });
    },
  });
}
