import React from 'react';
import { getConfidenceBadgeProps } from '../../lib/utils';
import { MatchDecision } from '../../types';

interface ConfidenceBadgeProps {
  score: number;
  decision?: MatchDecision;
  autoMergeThreshold?: number;
  manualReviewThreshold?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  score,
  decision,
  autoMergeThreshold = 85,
  manualReviewThreshold = 60,
  showScore = true,
  size = 'md',
  className = '',
}) => {
  const props = getConfidenceBadgeProps(score, autoMergeThreshold, manualReviewThreshold);

  let label = props.label;
  let bgClass = props.bgClass;
  let dotClass = props.dotClass;

  if (decision === 'auto_merge' || decision === 'approved') {
    label = decision === 'approved' ? 'MERGE APPROVED' : 'AUTO MERGE';
    bgClass = 'bg-[#EBF4EF] border-[#A8D3BC] text-[#287A52]';
    dotClass = 'bg-[#287A52]';
  } else if (decision === 'manual_review') {
    label = 'MANUAL REVIEW';
    bgClass = 'bg-[#FBF4EB] border-[#E8CEAB] text-[#A66A16]';
    dotClass = 'bg-[#A66A16]';
  } else if (decision === 'separate' || decision === 'rejected') {
    label = 'SEPARATE';
    bgClass = 'bg-[#F9ECEC] border-[#E8B8B8] text-[#B84242]';
    dotClass = 'bg-[#B84242]';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      id={`confidence-badge-${score}`}
      className={`inline-flex items-center rounded-md border tracking-wide whitespace-nowrap transition-colors ${sizeClasses[size]} ${bgClass} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {showScore && <span className="font-mono font-semibold">{score}%</span>}
      <span className="uppercase text-[10px] tracking-wider font-semibold">{label}</span>
    </span>
  );
};
