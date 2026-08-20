import { apiClient } from './client';
import type { Opportunity, PageResponse } from '../types';

export interface OpportunityListParams {
  page?: number;
  pageSize?: number;
  product?: string;
  sort?: string;
}

export const opportunityApi = {
  list: async (params: OpportunityListParams = {}): Promise<PageResponse<Opportunity>> => {
    const { data } = await apiClient.get<PageResponse<Opportunity>>('/opportunities', { params });
    return data;
  },

  updateStatus: async (id: string, status: string): Promise<Opportunity> => {
    const { data } = await apiClient.patch<Opportunity>(`/opportunities/${id}/status`, { status });
    return data;
  },
};
