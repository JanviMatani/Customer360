import React from 'react';
import { Check, X, HelpCircle } from 'lucide-react';

interface WhyPanelProps {
  reasons: Array<{
    label: string;
    value?: string;
    met: boolean;
  }>;
}

export const WhyPanel: React.FC<WhyPanelProps> = ({ reasons }) => {
  return (
    <div className="p-3.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] space-y-2 text-xs">
      <div className="font-bold text-[11px] uppercase tracking-wider text-[#20252B] flex items-center justify-between border-b border-[#D8D5CD] pb-1.5">
        <span>Why this opportunity qualifies:</span>
        <span className="text-[10px] text-[#2457A6] font-mono font-bold">Deterministic Engine</span>
      </div>

      <div className="space-y-1.5">
        {reasons.map((reason, idx) => (
          <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
            {reason.met ? (
              <span className="p-0.5 rounded bg-[#EBF4EF] text-[#287A52] border border-[#A8D3BC] shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </span>
            ) : (
              <span className="p-0.5 rounded bg-[#FFFFFF] text-[#68717C] border border-[#D8D5CD] shrink-0 mt-0.5">
                <X className="w-3 h-3" />
              </span>
            )}
            <div className="flex-1 text-[#20252B]">
              <span>{reason.label}</span>
              {reason.value && (
                <span className="ml-1.5 font-mono font-bold text-[#287A52]">
                  [{reason.value}]
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
