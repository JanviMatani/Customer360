import { apiClient } from './client';
import type { MatchWeightsConfig, OpportunityRulesConfig } from '../types';

export const configApi = {
  getMatchWeights: async (): Promise<MatchWeightsConfig> => {
    const { data } = await apiClient.get<MatchWeightsConfig>('/config');
    return data;
  },

  updateMatchWeights: async (config: Partial<MatchWeightsConfig>): Promise<MatchWeightsConfig> => {
    const { data } = await apiClient.put<MatchWeightsConfig>('/config', config);
    return data;
  },

  getOpportunityRules: async (): Promise<OpportunityRulesConfig> => {
    const { data } = await apiClient.get<OpportunityRulesConfig>('/config/opportunity-rules');
    return data;
  },

  updateOpportunityRules: async (config: Partial<OpportunityRulesConfig>): Promise<OpportunityRulesConfig> => {
    const { data } = await apiClient.put<OpportunityRulesConfig>('/config/opportunity-rules', config);
    return data;
  },
};
