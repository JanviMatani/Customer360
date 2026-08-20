import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Info } from 'lucide-react';
import { FieldEvidence, MatchResult } from '../../types';
import { MaskedField } from '../shared/MaskedField';

interface IdentityEvidenceTableProps {
  evidence: FieldEvidence[];
  overallConfidence: number;
  autoMergeThreshold?: number;
  manualReviewThreshold?: number;
}

export const IdentityEvidenceTable: React.FC<IdentityEvidenceTableProps> = ({
  evidence,
  overallConfidence,
  autoMergeThreshold = 85,
  manualReviewThreshold = 60,
}) => {
  const getResultBadge = (result: MatchResult, similarity?: number) => {
    switch (result) {
      case 'match':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#EBF4EF] border border-[#A8D3BC] text-[#287A52] text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>MATCH</span>
          </span>
        );
      case 'conflict':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F9ECEC] border border-[#E8B8B8] text-[#B84242] text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            <span>CONFLICT</span>
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FBF4EB] border border-[#E8CEAB] text-[#A66A16] text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{similarity ? `${similarity}% SIMILAR` : 'PARTIAL'}</span>
          </span>
        );
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-[#68717C] text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>MISSING</span>
          </span>
        );
    }
  };

  const getRowBg = (result: MatchResult) => {
    switch (result) {
      case 'match':
        return 'hover:bg-[#EBF4EF]/40';
      case 'conflict':
        return 'bg-[#F9ECEC]/50 hover:bg-[#F9ECEC]/80';
      case 'partial':
        return 'bg-[#FBF4EB]/50 hover:bg-[#FBF4EB]/80';
      default:
        return 'hover:bg-[#ECEAE4]/50';
    }
  };

  const isSensitiveField = (field: string) => {
    const f = field.toLowerCase();
    return f.includes('pan') || f.includes('mobile');
  };

  const getFieldType = (field: string): 'pan' | 'mobile' | 'email' | 'text' => {
    const f = field.toLowerCase();
    if (f.includes('pan')) return 'pan';
    if (f.includes('mobile')) return 'mobile';
    if (f.includes('email')) return 'email';
    return 'text';
  };

  return (
    <div id="identity-evidence-table-container" className="rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] overflow-hidden shadow-xs">
      <div className="p-4 border-b border-[#D8D5CD] flex items-center justify-between bg-[#ECEAE4]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#2457A6]" />
          <h3 className="text-sm font-bold text-[#20252B] uppercase tracking-wider">
            Identity Evidence & Probabilistic Match Breakdown
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#68717C]">
          <Info className="w-3.5 h-3.5 text-[#2457A6]" />
          <span>Explainable scoring based on configurable enterprise weights</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#D8D5CD] bg-[#ECEAE4] text-[#68717C] uppercase tracking-wider font-bold">
              <th className="py-3 px-4">Field Attribute</th>
              <th className="py-3 px-4">Primary Silo Value</th>
              <th className="py-3 px-4">Matched Silo Value</th>
              <th className="py-3 px-4 text-center font-mono">Weight (Pts)</th>
              <th className="py-3 px-4 text-center">Engine Result</th>
              <th className="py-3 px-4">Verification Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8D5CD] text-[#20252B] font-sans">
            {evidence.map((row, idx) => {
              const sensitive = isSensitiveField(row.field);
              const fieldType = getFieldType(row.field);

              return (
                <tr key={idx} className={`transition-colors ${getRowBg(row.result)}`}>
                  <td className="py-3 px-4 font-semibold text-[#20252B]">
                    {row.field}
                  </td>
                  <td className="py-3 px-4">
                    {sensitive ? (
                      <MaskedField value={row.valueA} type={fieldType} />
                    ) : (
                      <span className="font-mono text-[#20252B]">{row.valueA || '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {sensitive ? (
                      <MaskedField value={row.valueB} type={fieldType} />
                    ) : (
                      <span className="font-mono text-[#20252B]">{row.valueB || '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#2457A6]">
                    {row.weight}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getResultBadge(row.result, row.similarity)}
                  </td>
                  <td className="py-3 px-4 text-[#68717C] text-[11px] leading-relaxed">
                    {row.explanation || (row.result === 'match' ? 'Verified exact match' : 'Evaluated by rules')}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#D8D5CD] bg-[#ECEAE4] font-bold">
              <td colSpan={3} className="py-3.5 px-4 text-[#20252B] uppercase tracking-wider text-xs font-bold">
                Total Weighted Confidence Score
              </td>
              <td className="py-3.5 px-4 text-center font-mono text-[#20252B] text-xs">
                100 pts
              </td>
              <td className="py-3.5 px-4 text-center">
                <span className="font-mono text-base font-black text-[#2457A6]">
                  {overallConfidence}%
                </span>
              </td>
              <td className="py-3.5 px-4 text-xs text-[#68717C]">
                {overallConfidence >= autoMergeThreshold ? (
                  <span className="text-[#287A52] font-semibold">
                    ✓ Threshold Met (≥{autoMergeThreshold}%) → Auto Merged into Golden Record
                  </span>
                ) : overallConfidence >= manualReviewThreshold ? (
                  <span className="text-[#A66A16] font-semibold">
                    ⚠ In Review Range ({manualReviewThreshold}-{autoMergeThreshold - 1}%) → Routed to Compliance Queue
                  </span>
                ) : (
                  <span className="text-[#B84242] font-semibold">
                    ✗ Below Threshold (&lt;{manualReviewThreshold}%) → Maintained as Separate Legal Entities
                  </span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
