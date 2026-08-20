import { apiClient } from './client';
import type { AuditLog, PageResponse } from '../types';

export interface AuditParams {
  page?: number;
  pageSize?: number;
  action?: string;
  actorId?: string;
  targetId?: string;
}

export const auditApi = {
  getLogs: async (params: AuditParams = {}): Promise<PageResponse<AuditLog>> => {
    const { data } = await apiClient.get<PageResponse<AuditLog>>('/audit', { params });
    return data;
  },
};
