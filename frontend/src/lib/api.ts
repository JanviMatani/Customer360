import { useAuthStore } from '../store/authStore';
import {
  AuditLogEntry,
  AuthUser,
  DashboardStats,
  GoldenCustomer,
  MatchConfig,
  Opportunity,
  OpportunityRule,
  ReviewItem,
} from '../types';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError('Network connection failed. Please check backend server.', 0, err);
  }

  if (response.status === 401) {
    useAuthStore.getState().logout();
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  if (response.status === 403) {
    const errData = await response.json().catch(() => ({}));
    throw new ApiError(errData.error || 'Access Denied: You do not have permission for this resource.', 403, errData);
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new ApiError(errData.error || `Request failed with status ${response.status}`, response.status, errData);
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  login: (roleOrEmail: string, password?: string) =>
    request<{ user: AuthUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ role: roleOrEmail, email: roleOrEmail, password }),
    }),
  getMe: () => request<{ user: AuthUser }>('/api/auth/me'),
  logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
};

export const customersApi = {
  list: (params?: {
    search?: string;
    sourceSystem?: string;
    segment?: string;
    hasOpportunity?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.sourceSystem) query.set('sourceSystem', params.sourceSystem);
    if (params?.segment) query.set('segment', params.segment);
    if (params?.hasOpportunity !== undefined) query.set('hasOpportunity', String(params.hasOpportunity));
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    return request<{
      customers: GoldenCustomer[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/api/customers?${query.toString()}`);
  },

  getById: (goldenId: string) => request<GoldenCustomer>(`/api/customers/${goldenId}`),

  getOpportunities: (goldenId: string) => request<Opportunity[]>(`/api/customers/${goldenId}/opportunities`),

  overrideConflict: (
    goldenId: string,
    data: {
      field: string;
      selectedValue: string;
      selectedSource: string;
      reason: string;
    }
  ) =>
    request<{ success: boolean; customer: GoldenCustomer }>(`/api/customers/${goldenId}/conflicts/override`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const reviewApi = {
  list: (status: 'pending' | 'approved' | 'rejected' | 'all' = 'pending') =>
    request<{ items: ReviewItem[]; total: number }>(`/api/review?status=${status}`),

  decide: (id: string, decision: 'approved' | 'rejected', note?: string) =>
    request<{ success: boolean; item: ReviewItem }>(`/api/review/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, note }),
    }),
};

export const opportunitiesApi = {
  list: (params?: { rmId?: string; status?: string; product?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.rmId) query.set('rmId', params.rmId);
    if (params?.status) query.set('status', params.status);
    if (params?.product) query.set('product', params.product);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    return request<{ opportunities: Opportunity[]; total: number; page: number; limit: number }>(
      `/api/opportunities?${query.toString()}`
    );
  },

  updateStatus: (id: string, status: Opportunity['status']) =>
    request<{ success: boolean; opportunity: Opportunity }>(`/api/opportunities/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const configApi = {
  get: () =>
    request<{
      matchConfig: MatchConfig;
      opportunityRules: OpportunityRule[];
    }>('/api/config'),

  updateMatchConfig: (data: {
    weights?: MatchConfig['weights'];
    autoMergeThreshold?: number;
    manualReviewThreshold?: number;
  }) =>
    request<{ success: boolean; matchConfig: MatchConfig }>('/api/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateOpportunityRules: (rules: OpportunityRule[]) =>
    request<{ success: boolean; opportunityRules: OpportunityRule[] }>('/api/config/opportunity-rules', {
      method: 'PUT',
      body: JSON.stringify({ rules }),
    }),
};

export const auditApi = {
  list: (params?: { action?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.action) query.set('action', params.action);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    return request<{ logs: AuditLogEntry[]; total: number; page: number; limit: number }>(
      `/api/audit?${query.toString()}`
    );
  },
};

export const dashboardApi = {
  getStats: () => request<DashboardStats>('/api/dashboard/stats'),
};

export const securityApi = {
  logUnauthorized: (data: { path: string; attemptedAction?: string }) =>
    request<{ success: boolean }>('/api/security/log-unauthorized', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
