import { apiClient } from './client';
import type { ConflictQueueItem } from '../types';

export const reviewApi = {
  getQueue: async (status = 'PENDING'): Promise<ConflictQueueItem[]> => {
    const { data } = await apiClient.get<ConflictQueueItem[]>('/review', { params: { status } });
    return data;
  },

  decide: async (id: string, decision: 'MERGE' | 'SEPARATE', note?: string): Promise<ConflictQueueItem> => {
    const { data } = await apiClient.post<ConflictQueueItem>(`/review/${id}/decide`, { decision, note });
    return data;
  },
};
