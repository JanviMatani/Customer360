import React, { useState } from 'react';
import {
  GitMerge,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  ArrowLeftRight,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ReviewItem } from '../../types';
import { ConfidenceBadge } from '../shared/ConfidenceBadge';
import { SourceBadge } from '../shared/SourceBadge';
import { MaskedField } from '../shared/MaskedField';
import { formatDateTime } from '../../lib/utils';
import { useDecideReview } from '../../hooks/useReview';
import confetti from 'canvas-confetti';

interface ReviewComparisonCardProps {
  item: ReviewItem;
}

export const ReviewComparisonCard: React.FC<ReviewComparisonCardProps> = ({ item }) => {
  const decideMutation = useDecideReview();
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEvidence, setShowEvidence] = useState(true);

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    setIsSubmitting(true);
    try {
      await decideMutation.mutateAsync({
        id: item.id,
        decision,
        note:
          note ||
          (decision === 'approved'
            ? 'Identity verified & approved for merging'
            : 'Confirmed as separate distinct entities'),
      });
      if (decision === 'approved') {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = item.decision === 'pending';

  const matchCount = item.evidence.filter((e) => e.result === 'match').length;
  const conflictCount = item.evidence.filter((e) => e.result === 'conflict').length;
  const partialCount = item.evidence.filter((e) => e.result === 'partial').length;

  return (
    <div
      id={`review-item-${item.id}`}
      className={`rounded-lg border bg-[#FFFFFF] shadow-xs overflow-hidden transition-all ${
        item.isDangerousConflict
          ? 'border-[#E8B8B8]'
          : item.decision === 'approved'
          ? 'border-[#A8D3BC]'
          : 'border-[#D8D5CD]'
      }`}
    >
      {/* Dangerous Conflict Header Banner */}
      {item.isDangerousConflict && (
        <div className="bg-[#B84242] px-5 py-3 flex items-start gap-3">
          <div className="p-1.5 rounded bg-white/20 shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide uppercase">
              DANGEROUS CONFLICT — Cannot auto-merge
            </div>
            <div className="text-[11px] text-white/85 leading-snug mt-0.5">
              {item.conflictReason ||
                'Critical identifiers (PAN/DOB) conflict despite matching secondary fields. Blocked by hard compliance rule and routed to manual review.'}
            </div>
          </div>
        </div>
      )}

      {/* Card Header */}
      <div className="px-5 py-4 border-b border-[#D8D5CD] bg-[#ECEAE4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] flex items-center justify-center text-[#2457A6] shrink-0">
            <GitMerge className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-xs text-[#2457A6] bg-[#EBF1FA] px-2 py-0.5 rounded border border-[#BCD1F0]">
                {item.id}
              </span>
              <h4 className="text-sm font-bold text-[#20252B] truncate">
                {item.candidateName || 'Potential Match Candidate'}
              </h4>
            </div>
            <div className="text-[11px] text-[#68717C] mt-0.5">
              Identity comparison across disparate operational silos
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ConfidenceBadge score={item.confidence} decision={item.decision} size="md" />
        </div>
      </div>

      {/* Match Score Summary Row */}
      <div className="px-5 py-2.5 border-b border-[#D8D5CD] bg-[#FFFFFF] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-[#287A52]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {matchCount} Match{matchCount !== 1 ? 'es' : ''}
          </span>
          {partialCount > 0 && (
            <span className="flex items-center gap-1.5 font-semibold text-[#A66A16]">
              <AlertTriangle className="w-3.5 h-3.5" />
              {partialCount} Partial
            </span>
          )}
          {conflictCount > 0 && (
            <span className="flex items-center gap-1.5 font-semibold text-[#B84242]">
              <XCircle className="w-3.5 h-3.5" />
              {conflictCount} Conflict{conflictCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowEvidence((v) => !v)}
          className="flex items-center gap-1 text-xs text-[#68717C] hover:text-[#20252B] font-medium cursor-pointer"
        >
          {showEvidence ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Hide Evidence</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Show Evidence</span>
            </>
          )}
        </button>
      </div>

      {/* Evidence Comparison Grid */}
      {showEvidence && (
        <div className="px-5 py-4">
          {/* Source System Headers */}
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-[#68717C] uppercase tracking-wider pb-2 border-b border-[#ECEAE4] mb-2">
            <div className="col-span-3">Field</div>
            <div className="col-span-4 flex items-center gap-1.5">
              <SourceBadge source={item.sourceA.system} size="sm" />
              <span className="font-mono text-[#20252B]">{item.sourceA.sourceCustomerId}</span>
            </div>
            <div className="col-span-1 text-center">
              <ArrowLeftRight className="w-3.5 h-3.5 mx-auto text-[#BCB8AD]" />
            </div>
            <div className="col-span-4 flex items-center gap-1.5">
              <SourceBadge source={item.sourceB.system} size="sm" />
              <span className="font-mono text-[#20252B]">{item.sourceB.sourceCustomerId}</span>
            </div>
          </div>

          {/* Evidence Rows */}
          <div className="space-y-1 text-xs">
            {item.evidence.map((ev, idx) => {
              const isPanOrMobile =
                ev.field.toLowerCase().includes('pan') || ev.field.toLowerCase().includes('mobile');
              const fieldType = ev.field.toLowerCase().includes('pan')
                ? 'pan'
                : ev.field.toLowerCase().includes('mobile')
                ? 'mobile'
                : 'text';

              const rowStyle =
                ev.result === 'conflict'
                  ? 'bg-[#FDF4F4] border-l-2 border-[#B84242]'
                  : ev.result === 'match'
                  ? 'bg-[#F4FBF7] border-l-2 border-[#287A52]'
                  : ev.result === 'partial'
                  ? 'bg-[#FFFAF3] border-l-2 border-[#A66A16]'
                  : 'bg-[#FAFAF9] border-l-2 border-[#D8D5CD]';

              return (
                <div
                  key={idx}
                  className={`grid grid-cols-12 gap-2 px-3 py-2.5 rounded-md items-center ${rowStyle}`}
                >
                  <div className="col-span-3 flex items-center gap-1.5">
                    <span className="font-semibold text-[#20252B]">{ev.field}</span>
                    <span className="text-[10px] text-[#68717C] font-mono bg-[#ECEAE4] px-1.5 py-0.5 rounded border border-[#D8D5CD]">
                      {ev.weight}pt
                    </span>
                  </div>

                  <div className="col-span-4 font-mono truncate">
                    {isPanOrMobile ? (
                      <MaskedField value={ev.valueA} type={fieldType} />
                    ) : (
                      <span className="text-[#20252B]">{ev.valueA || '—'}</span>
                    )}
                  </div>

                  <div className="col-span-1 flex items-center justify-center">
                    {ev.result === 'match' && (
                      <CheckCircle2 className="w-4 h-4 text-[#287A52]" />
                    )}
                    {ev.result === 'conflict' && (
                      <XCircle className="w-4 h-4 text-[#B84242]" />
                    )}
                    {ev.result === 'partial' && (
                      <span className="text-[10px] font-bold text-[#A66A16] font-mono bg-[#FBF4EB] px-1.5 py-0.5 rounded border border-[#E8CEAB]">
                        {ev.similarity}%
                      </span>
                    )}
                    {ev.result === 'missing' && (
                      <span className="text-[#BCB8AD] text-sm font-bold">—</span>
                    )}
                  </div>

                  <div className="col-span-4 font-mono truncate">
                    {isPanOrMobile ? (
                      <MaskedField value={ev.valueB} type={fieldType} />
                    ) : (
                      <span className="text-[#20252B]">{ev.valueB || '—'}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Decision / Action Section */}
      {isPending ? (
        <div className="px-5 pb-5 pt-1 border-t border-[#D8D5CD] bg-[#FAFAF9] space-y-3">
          <div className="text-[11px] font-bold text-[#68717C] uppercase tracking-wider pt-4">
            Reviewer Decision
          </div>

          <textarea
            rows={2}
            placeholder="Add compliance resolution note (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2.5 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-xs text-[#20252B] placeholder-[#BCB8AD] focus:border-[#2457A6] focus:ring-1 focus:ring-[#2457A6] focus:outline-none transition-all resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              id={`reject-review-${item.id}`}
              disabled={isSubmitting}
              onClick={() => handleDecision('rejected')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#FFFFFF] hover:bg-[#F9ECEC] border border-[#D8D5CD] hover:border-[#E8B8B8] text-[#20252B] hover:text-[#B84242] text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Keep Separate</span>
            </button>
            <button
              id={`approve-merge-${item.id}`}
              disabled={isSubmitting || item.isDangerousConflict}
              onClick={() => handleDecision('approved')}
              title={
                item.isDangerousConflict
                  ? 'Cannot merge: dangerous identity conflict detected'
                  : 'Approve as the same person and merge records'
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#287A52] hover:bg-[#1E5C3E] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{item.isDangerousConflict ? 'Merge Blocked' : 'Approve & Merge'}</span>
            </button>
          </div>

          {item.isDangerousConflict && (
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-[#F9ECEC] border border-[#E8B8B8] text-[11px] text-[#B84242]">
              <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Hard compliance rule prevents auto-merge due to conflicting critical identifiers. A
                manual fraud investigation is required before any merge action.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="px-5 py-3 border-t border-[#D8D5CD] bg-[#FAFAF9]">
          <div
            className={`flex items-center justify-between p-3 rounded-md text-xs ${
              item.decision === 'approved'
                ? 'bg-[#EBF4EF] border border-[#A8D3BC]'
                : 'bg-[#F9ECEC] border border-[#E8B8B8]'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCheck
                className={`w-4 h-4 ${
                  item.decision === 'approved' ? 'text-[#287A52]' : 'text-[#B84242]'
                }`}
              />
              <div>
                <span
                  className={`font-semibold ${
                    item.decision === 'approved' ? 'text-[#287A52]' : 'text-[#B84242]'
                  }`}
                >
                  {item.decision === 'approved' ? 'Approved & Merged' : 'Rejected — Kept Separate'}
                </span>
                <span className="text-[#68717C] ml-1">
                  by <strong className="text-[#20252B]">{item.reviewedBy}</strong> on{' '}
                  {formatDateTime(item.reviewedAt)}
                </span>
              </div>
            </div>
            {item.note && (
              <span className="italic text-[#68717C] text-[11px] max-w-xs truncate">
                "{item.note}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
