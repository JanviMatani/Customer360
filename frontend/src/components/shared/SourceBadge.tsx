import React from 'react';
import { getSourceDetails } from '../../lib/utils';
import { SourceSystem } from '../../types';

interface SourceBadgeProps {
  source: SourceSystem | string;
  showFullName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  source,
  showFullName = false,
  size = 'md',
  className = '',
  onClick,
}) => {
  const details = getSourceDetails(source);

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 font-mono font-semibold',
    md: 'text-xs px-2 py-0.5 font-medium',
    lg: 'text-sm px-2.5 py-1 font-semibold',
  };

  return (
    <span
      id={`source-badge-${source}`}
      onClick={onClick}
      title={`${details.name} (Source Silo)`}
      className={`inline-flex items-center rounded-md border tracking-wide whitespace-nowrap select-none transition-all ${sizeClasses[size]} ${details.color} ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      } ${className}`}
    >
      <span className="font-mono font-bold">{details.code}</span>
      {showFullName && <span className="ml-1.5 opacity-90">{details.name}</span>}
    </span>
  );
};
