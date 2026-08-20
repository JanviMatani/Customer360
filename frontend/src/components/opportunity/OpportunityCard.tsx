import React from 'react';
import { Sparkles, ArrowUpRight, CheckCircle2, Ban, Clock, Play } from 'lucide-react';
import { Opportunity, OpportunityProduct, OpportunityStatus } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { WhyPanel } from './WhyPanel';
import { useUpdateOpportunityStatus } from '../../hooks/useOpportunities';
import confetti from 'canvas-confetti';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewProfile?: () => void;
}

const PRODUCT_META: Record<
  OpportunityProduct,
  { label: string; icon: string; borderClass: string; badgeClass: string }
> = {
  insurance: {
    label: 'INSURANCE PROTECTION',
    icon: '🛡️',
    borderClass: 'border-[#A8D3BC] hover:border-[#287A52]',
    badgeClass: 'bg-[#EBF4EF] text-[#287A52] border-[#A8D3BC]',
  },
  wealth: {
    label: 'WEALTH MANAGEMENT ADVISORY',
    icon: '💎',
    borderClass: 'border-[#BCD1F0] hover:border-[#2457A6]',
    badgeClass: 'bg-[#EBF1FA] text-[#2457A6] border-[#BCD1F0]',
  },
  loans: {
    label: 'LOAN AGAINST SECURITIES (LAS)',
    icon: '💳',
    borderClass: 'border-[#E8CEAB] hover:border-[#A66A16]',
    badgeClass: 'bg-[#FBF4EB] text-[#A66A16] border-[#E8CEAB]',
  },
  mf: {
    label: 'MUTUAL FUND SIP',
    icon: '📊',
    borderClass: 'border-[#D8D5CD] hover:border-[#68717C]',
    badgeClass: 'bg-[#ECEAE4] text-[#20252B] border-[#D8D5CD]',
  },
  equity: {
    label: 'DIRECT EQUITY DEMAT',
    icon: '📈',
    borderClass: 'border-[#BCD1F0] hover:border-[#2457A6]',
    badgeClass: 'bg-[#EBF1FA] text-[#2457A6] border-[#BCD1F0]',
  },
};

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onViewProfile }) => {
  const updateStatusMutation = useUpdateOpportunityStatus();
  const meta = PRODUCT_META[opportunity.product] || PRODUCT_META.wealth;

  const handleStatusChange = async (newStatus: OpportunityStatus) => {
    await updateStatusMutation.mutateAsync({
      id: opportunity.id,
      status: newStatus,
    });

    if (newStatus === 'converted') {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    }
  };

  const getStatusBadge = (status: OpportunityStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2 py-0.5 rounded-full bg-[#EBF1FA] border border-[#BCD1F0] text-[#2457A6] text-[10px] font-bold uppercase tracking-wider">
            NEW
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-0.5 rounded-full bg-[#FBF4EB] border border-[#E8CEAB] text-[#A66A16] text-[10px] font-bold uppercase tracking-wider">
            IN PROGRESS
          </span>
        );
      case 'converted':
        return (
          <span className="px-2 py-0.5 rounded-full bg-[#EBF4EF] border border-[#A8D3BC] text-[#287A52] text-[10px] font-bold uppercase tracking-wider">
            CONVERTED
          </span>
        );
      case 'dismissed':
        return (
          <span className="px-2 py-0.5 rounded-full bg-[#ECEAE4] border border-[#D8D5CD] text-[#68717C] text-[10px] font-bold uppercase tracking-wider">
            DISMISSED
          </span>
        );
    }
  };

  return (
    <div
      id={`opp-card-${opportunity.id}`}
      className={`p-5 rounded-lg border bg-[#FFFFFF] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between ${meta.borderClass}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D8D5CD]">
          <div className="flex items-center gap-2">
            <span className="text-xl">{meta.icon}</span>
            <div>
              <div className="text-xs font-bold text-[#20252B] tracking-wide">
                {meta.label}
              </div>
              <div className="text-[11px] text-[#68717C]">
                Candidate: <strong className="text-[#20252B]">{opportunity.customerName}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(opportunity.status)}
          </div>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 rounded-md bg-[#ECEAE4] border border-[#D8D5CD]">
            <span className="text-[10px] font-medium text-[#68717C] uppercase tracking-wider block mb-0.5">
              Propensity Score
            </span>
            <div className="font-mono text-xl font-black text-[#2457A6] flex items-center gap-1">
              <span>{opportunity.score}</span>
              <span className="text-xs text-[#68717C] font-normal">/ 100</span>
            </div>
          </div>

          <div className="p-3 rounded-md bg-[#ECEAE4] border border-[#D8D5CD]">
            <span className="text-[10px] font-medium text-[#68717C] uppercase tracking-wider block mb-0.5">
              Potential Value
            </span>
            <div className="font-mono text-xl font-black text-[#287A52]">
              {formatCurrency(opportunity.potentialValue)}
            </div>
          </div>
        </div>

        {/* Explainability Why Checklist */}
        <WhyPanel reasons={opportunity.reasons} />
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-[#D8D5CD] flex items-center justify-between gap-2">
        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className="text-xs text-[#2457A6] hover:text-[#183B70] font-bold cursor-pointer"
          >
            View Customer 360 →
          </button>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {opportunity.status === 'new' && (
            <button
              id={`initiate-opp-${opportunity.id}`}
              onClick={() => handleStatusChange('in_progress')}
              disabled={updateStatusMutation.isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#2457A6] hover:bg-[#183B70] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              <span>Initiate</span>
            </button>
          )}

          {opportunity.status === 'in_progress' && (
            <button
              id={`convert-opp-${opportunity.id}`}
              onClick={() => handleStatusChange('converted')}
              disabled={updateStatusMutation.isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#287A52] hover:bg-[#1E5C3E] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Convert</span>
            </button>
          )}

          {opportunity.status !== 'dismissed' && opportunity.status !== 'converted' && (
            <button
              id={`dismiss-opp-${opportunity.id}`}
              onClick={() => handleStatusChange('dismissed')}
              disabled={updateStatusMutation.isPending}
              className="px-2.5 py-1.5 rounded-md bg-[#ECEAE4] hover:bg-[#D8D5CD] text-[#68717C] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 border border-[#D8D5CD]"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
