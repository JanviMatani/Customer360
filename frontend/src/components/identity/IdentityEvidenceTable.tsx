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
    // Normalize — backend Java enum serializes as uppercase (MATCH, CONFLICT etc.)
    const r = result?.toLowerCase?.() as MatchResult ?? result;
    switch (r) {
      case 'match':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
            <CheckCircle2 size={11} />
            <span>MATCH</span>
          </span>
        );
      case 'conflict':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold">
            <XCircle size={11} />
            <span>CONFLICT</span>
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
            <AlertTriangle size={11} />
            <span>{similarity ? `${similarity}% SIMILAR` : 'PARTIAL'}</span>
          </span>
        );
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-gray-50 border border-gray-200 text-gray-500 text-[10px] font-semibold">
            <HelpCircle size={11} />
            <span>MISSING</span>
          </span>
        );
    }
  };

  const getRowBg = (result: MatchResult) => {
    const r = result?.toLowerCase?.() as MatchResult ?? result;
    switch (r) {
      case 'match':
        return 'hover:bg-[#F0FDF4]/30';
      case 'conflict':
        return 'bg-[#FEF2F2]/60 hover:bg-[#FEF2F2]';
      case 'partial':
        return 'bg-[#FFFBEB]/60 hover:bg-[#FFFBEB]';
      default:
        return 'hover:bg-gray-50';
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
    <div id="identity-evidence-table-container" className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-2xs">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1B4FD8]" />
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Identity Resolution Verification Table
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
          <Info size={13} className="text-[#1B4FD8]" />
          <span>Calculated by Golden Resolution weights</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-500 uppercase tracking-wider font-bold">
              <th className="py-2.5 px-4">Field Attribute</th>
              <th className="py-2.5 px-4">Primary Value</th>
              <th className="py-2.5 px-4">Secondary value</th>
              <th className="py-2.5 px-4 text-center font-mono">Weight</th>
              <th className="py-2.5 px-4 text-center">Engine Result</th>
              <th className="py-2.5 px-4">Verification Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 font-sans">
            {evidence.map((row, idx) => {
              const sensitive = isSensitiveField(row.field);
              const fieldType = getFieldType(row.field);

              return (
                <tr key={idx} className={`transition-colors ${getRowBg(row.result)}`}>
                  <td className="py-2.5 px-4 font-semibold text-gray-900">
                    {row.field}
                  </td>
                  <td className="py-2.5 px-4">
                    {sensitive ? (
                      <MaskedField value={row.valueA} type={fieldType} />
                    ) : (
                      <span className="font-mono text-gray-900">{row.valueA || '—'}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    {sensitive ? (
                      <MaskedField value={row.valueB} type={fieldType} />
                    ) : (
                      <span className="font-mono text-gray-900">{row.valueB || '—'}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-[#1B4FD8]">
                    {row.weight} pts
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {getResultBadge(row.result, row.similarity)}
                  </td>
                  <td className="py-2.5 px-4 text-gray-500 text-[11px] leading-relaxed">
                    {row.explanation || (row.result === 'match' ? 'Exact PII mapping' : 'Matching rule evaluated')}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
              <td colSpan={3} className="py-3 px-4 text-gray-800 uppercase tracking-wider text-[11px] font-bold">
                Overall Resolution Confidence
              </td>
              <td className="py-3 px-4 text-center font-mono text-gray-800">
                100 pts
              </td>
              <td className="py-3 px-4 text-center">
                <span className="font-mono text-sm font-extrabold text-[#1B4FD8]">
                  {overallConfidence}%
                </span>
              </td>
              <td className="py-3 px-4 text-[11px] text-gray-500">
                {overallConfidence >= autoMergeThreshold ? (
                  <span className="text-emerald-700 font-bold">
                    ✓ Clean Auto-Merge Met (≥{autoMergeThreshold}%)
                  </span>
                ) : overallConfidence >= manualReviewThreshold ? (
                  <span className="text-amber-700 font-bold">
                    ⚠ In Review Range ({manualReviewThreshold}-{autoMergeThreshold - 1}%)
                  </span>
                ) : (
                  <span className="text-red-700 font-bold">
                    ✗ Below Threshold (&lt;{manualReviewThreshold}%)
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
