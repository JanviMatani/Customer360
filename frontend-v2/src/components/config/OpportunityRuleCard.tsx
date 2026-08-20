import React, { useState } from 'react';
import { Sparkles, Save, CheckCircle, ShieldCheck, HelpCircle } from 'lucide-react';
import { OpportunityRule } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useUpdateOpportunityRules } from '../../hooks/useConfig';
import confetti from 'canvas-confetti';

interface OpportunityRuleCardProps {
  rule: OpportunityRule;
  allRules: OpportunityRule[];
}

export const OpportunityRuleCard: React.FC<OpportunityRuleCardProps> = ({ rule, allRules }) => {
  const updateMutation = useUpdateOpportunityRules();
  const [enabled, setEnabled] = useState(rule.enabled);
  const [minEquity, setMinEquity] = useState(rule.conditions.minEquityBalance ?? 500000);
  const [minMf, setMinMf] = useState(rule.conditions.minMfBalance ?? 500000);
  const [minTRV, setMinTRV] = useState(rule.conditions.minTotalRelationshipValue ?? 1000000);
  const [minScore, setMinScore] = useState(rule.conditions.minScore ?? 65);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedRules = allRules.map((r) => {
      if (r.id === rule.id) {
        return {
          ...r,
          enabled,
          conditions: {
            ...r.conditions,
            minEquityBalance: minEquity,
            minMfBalance: minMf,
            minTotalRelationshipValue: minTRV,
            minScore,
          },
        };
      }
      return r;
    });

    await updateMutation.mutateAsync(updatedRules);
    setSaved(true);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setSaved(false), 2500);
  };

  const getProductIcon = (product: string) => {
    switch (product) {
      case 'insurance':
        return '🛡️';
      case 'wealth':
        return '💎';
      case 'loans':
        return '💳';
      case 'mf':
        return '📊';
      default:
        return '📈';
    }
  };

  return (
    <div
      id={`opp-rule-card-${rule.id}`}
      className="p-5 rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] shadow-xs space-y-4 transition-all hover:border-[#68717C]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D8D5CD]">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{getProductIcon(rule.product)}</span>
          <div>
            <h4 className="text-sm font-bold text-[#20252B] uppercase tracking-wide">
              {rule.title}
            </h4>
            <div className="text-xs text-[#68717C] font-mono">
              Target Product: <strong className="text-[#2457A6]">{rule.product.toUpperCase()}</strong>
            </div>
          </div>
        </div>

        {/* Enabled Toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs text-[#68717C] font-medium">
            {enabled ? (
              <span className="text-[#287A52] font-bold">ACTIVE ●</span>
            ) : (
              <span className="text-[#68717C]">PAUSED ○</span>
            )}
          </span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-[#D8D5CD] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2457A6] relative" />
        </label>
      </div>

      <p className="text-xs text-[#20252B] leading-relaxed">{rule.description}</p>

      {/* Editable Rule Conditions Form */}
      <form onSubmit={handleSave} className="space-y-4 pt-2">
        <div className="p-4 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] space-y-3 text-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#20252B] border-b border-[#D8D5CD] pb-1.5 flex items-center justify-between">
            <span>Deterministic Qualification Rules</span>
            <span className="text-[#2457A6] font-mono">Real-time Recalculation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rule.conditions.minEquityBalance !== undefined && (
              <div>
                <label className="block text-[#68717C] mb-1 font-semibold">
                  IF Equity balance &gt;
                </label>
                <select
                  value={minEquity}
                  onChange={(e) => setMinEquity(Number(e.target.value))}
                  className="w-full p-2 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-[#20252B] font-mono text-xs focus:border-[#2457A6] focus:outline-hidden"
                >
                  <option value={100000}>₹1 Lakh (Low Threshold)</option>
                  <option value={300000}>₹3 Lakhs</option>
                  <option value={500000}>₹5 Lakhs (Standard)</option>
                  <option value={1000000}>₹10 Lakhs</option>
                  <option value={1500000}>₹15 Lakhs (High Threshold - Triggers Amit / Rahul filter)</option>
                  <option value={2000000}>₹20 Lakhs (Ultra Strict)</option>
                </select>
              </div>
            )}

            {rule.conditions.minMfBalance !== undefined && (
              <div>
                <label className="block text-[#68717C] mb-1 font-semibold">
                  AND Mutual Fund balance &gt;
                </label>
                <select
                  value={minMf}
                  onChange={(e) => setMinMf(Number(e.target.value))}
                  className="w-full p-2 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-[#20252B] font-mono text-xs focus:border-[#2457A6] focus:outline-hidden"
                >
                  <option value={100000}>₹1 Lakh</option>
                  <option value={500000}>₹5 Lakhs (Standard)</option>
                  <option value={800000}>₹8 Lakhs</option>
                  <option value={1200000}>₹12 Lakhs</option>
                  <option value={2000000}>₹20 Lakhs</option>
                </select>
              </div>
            )}

            {rule.conditions.minTotalRelationshipValue !== undefined && (
              <div>
                <label className="block text-[#68717C] mb-1 font-semibold">
                  Total Relationship Value &gt;
                </label>
                <select
                  value={minTRV}
                  onChange={(e) => setMinTRV(Number(e.target.value))}
                  className="w-full p-2 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-[#20252B] font-mono text-xs focus:border-[#2457A6] focus:outline-hidden"
                >
                  <option value={200000}>₹2 Lakhs</option>
                  <option value={500000}>₹5 Lakhs</option>
                  <option value={1000000}>₹10 Lakhs</option>
                  <option value={2000000}>₹20 Lakhs (HNI Tier)</option>
                  <option value={5000000}>₹50 Lakhs (Wealth Tier)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-[#68717C] mb-1 font-semibold">
                Minimum Propensity Score &gt;=
              </label>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full p-2 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-[#20252B] font-mono text-xs focus:border-[#2457A6] focus:outline-hidden"
              >
                <option value={50}>50 (Broad Reach)</option>
                <option value={60}>60 (Standard)</option>
                <option value={70}>70 (High Confidence)</option>
                <option value={80}>80 (Elite Strict)</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] text-[#68717C] flex items-center gap-1.5 pt-1">
            <span className="text-[#287A52] font-semibold">AND Rule:</span>
            <span>Customer has zero active {rule.product.toUpperCase()} holdings in all enterprise records</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[#68717C]">
            Saving recalculates matching opportunities across all portfolios instantly.
          </span>

          <button
            type="submit"
            id={`save-rule-btn-${rule.id}`}
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#2457A6] hover:bg-[#183B70] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {saved ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>Rule Saved & Applied!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Rule</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
