import { apiClient } from './client';
import type { Customer360Response, GoldenCustomer, Opportunity, PageResponse } from '../types';

export interface CustomerListParams {
  page?: number;
  pageSize?: number;
  city?: string;
}

export const customerApi = {
  list: async (params: CustomerListParams = {}): Promise<PageResponse<GoldenCustomer>> => {
    const { data } = await apiClient.get<PageResponse<GoldenCustomer>>('/customers', { params });
    return data;
  },

  getById: async (goldenId: string): Promise<Customer360Response> => {
    const { data } = await apiClient.get<Customer360Response>(`/customers/${goldenId}`);
    return data;
  },

  getOpportunities: async (goldenId: string): Promise<Opportunity[]> => {
    const { data } = await apiClient.get<Opportunity[]>(`/customers/${goldenId}/opportunities`);
    return data;
  },
};
