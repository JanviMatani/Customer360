import React, { useState } from 'react';
import { Sliders, Sparkles, FileText, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { RoleGuard } from '../components/shared/RoleGuard';
import { MatchWeightSliders } from '../components/config/MatchWeightSliders';
import { OpportunityRuleCard } from '../components/config/OpportunityRuleCard';
import { AuditLogTable } from '../components/config/AuditLogTable';
import { useConfig } from '../hooks/useConfig';

export const ConfigurationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'weights' | 'rules' | 'audit'>('weights');
  const { data: configData, isLoading } = useConfig();

  return (
    <RoleGuard
      allowedRoles={['admin']}
      fallbackTitle="System Administrator Access Only"
      fallbackMessage="The Configuration & Rules Engine allows live tuning of probabilistic match thresholds, weight matrices, and opportunity business rules. This module is restricted to Admin personnel to ensure data integrity and compliance."
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8D5CD]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-[#20252B] uppercase tracking-tight">
                Engine Configuration & Rule Tuning
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-md bg-[#F9ECEC] border border-[#E8B8B8] text-[#B84242] font-mono font-semibold">
                ADMIN ACCESS
              </span>
            </div>
            <p className="text-xs text-[#68717C]">
              Live parameter tuning for identity matching weights, decision threshold boundaries, and cross-sell rules.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#ECEAE4] border border-[#D8D5CD] rounded-lg">
            <button
              id="config-tab-weights"
              onClick={() => setActiveTab('weights')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'weights'
                  ? 'bg-[#2457A6] text-white shadow-xs'
                  : 'text-[#68717C] hover:text-[#20252B]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Match Weights</span>
            </button>

            <button
              id="config-tab-rules"
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-[#2457A6] text-white shadow-xs'
                  : 'text-[#68717C] hover:text-[#20252B]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cross-Sell Rules</span>
            </button>

            <button
              id="config-tab-audit"
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-[#2457A6] text-white shadow-xs'
                  : 'text-[#68717C] hover:text-[#20252B]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Trail</span>
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        {isLoading || !configData ? (
          <div className="p-12 text-center text-[#68717C] font-mono text-xs">
            Loading engine configuration...
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'weights' && (
              <div className="space-y-4">
                <MatchWeightSliders config={configData.matchConfig} />
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {configData.opportunityRules.map((rule) => (
                    <OpportunityRuleCard
                      key={rule.id}
                      rule={rule}
                      allRules={configData.opportunityRules}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-4">
                <AuditLogTable />
              </div>
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
};
