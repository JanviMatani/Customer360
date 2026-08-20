import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatItem {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'blue' | 'green' | 'amber' | 'crimson' | 'purple';
}

interface StatSummaryRowProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4 | 5 | 6;
}

export const StatSummaryRow: React.FC<StatSummaryRowProps> = ({ stats, columns = 4 }) => {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  }[columns];

  const toneStyles = {
    default: {
      text: 'text-[#20252B]',
      icon: 'text-[#68717C]',
      border: 'border-[#D8D5CD]',
    },
    blue: {
      text: 'text-[#2457A6]',
      icon: 'text-[#2457A6]',
      border: 'border-[#D8D5CD]',
    },
    green: {
      text: 'text-[#287A52]',
      icon: 'text-[#287A52]',
      border: 'border-[#D8D5CD]',
    },
    amber: {
      text: 'text-[#A66A16]',
      icon: 'text-[#A66A16]',
      border: 'border-[#E8CEAB]',
    },
    crimson: {
      text: 'text-[#B84242]',
      icon: 'text-[#B84242]',
      border: 'border-[#E8B8B8]',
    },
    purple: {
      text: 'text-[#6A3BB8]',
      icon: 'text-[#6A3BB8]',
      border: 'border-[#D6C7F0]',
    },
  };

  return (
    <div className={`grid ${colClasses} gap-3 sm:gap-4`}>
      {stats.map((item, idx) => {
        const tone = item.tone || 'default';
        const styles = toneStyles[tone];
        const Icon = item.icon;

        return (
          <div
            key={idx}
            className={`p-4 rounded-lg bg-[#FFFFFF] border ${styles.border} shadow-xs flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between text-[#68717C] mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider truncate">
                {item.label}
              </span>
              {Icon && <Icon className={`w-4 h-4 ${styles.icon} shrink-0`} />}
            </div>

            <div className={`font-mono text-xl sm:text-2xl font-bold ${styles.text} tracking-tight`}>
              {item.value}
            </div>

            {item.subtext && (
              <div className="text-[10px] text-[#68717C] mt-1 font-mono truncate">
                {item.subtext}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
