import { pipelineClient, apiClient } from './client';

export const adminApi = {
  // Pipeline rebuild can take 1-3 minutes — use 5-minute timeout client
  reloadAndRematch: async (): Promise<{ message: string; evaluatedPairs: number }> => {
    const { data } = await pipelineClient.post('/admin/ingest/reload');
    return data;
  },

  rematch: async (): Promise<{ message: string; evaluatedPairs: number }> => {
    const { data } = await pipelineClient.post('/admin/rematch');
    return data;
  },

  // Opportunity recompute is fast — standard timeout is fine
  recomputeOpportunities: async (): Promise<{ message: string; generatedOpportunities: number }> => {
    const { data } = await apiClient.post('/admin/opportunities/recompute');
    return data;
  },
};
