import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number | string | null;
  badgeTone?: 'default' | 'blue' | 'amber' | 'crimson' | 'green';
}

interface TabbedHeaderLayoutProps {
  header: React.ReactNode;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

export const TabbedHeaderLayout: React.FC<TabbedHeaderLayoutProps> = ({
  header,
  tabs,
  activeTab,
  onTabChange,
  children,
}) => {
  const badgeClasses = {
    default: 'bg-[#ECEAE4] text-[#20252B] border-[#D8D5CD]',
    blue: 'bg-[#EBF1FA] text-[#2457A6] border-[#BCD1F0]',
    amber: 'bg-[#FBF4EB] text-[#A66A16] border-[#E8CEAB]',
    crimson: 'bg-[#F9ECEC] text-[#B84242] border-[#E8B8B8]',
    green: 'bg-[#EBF4EF] text-[#287A52] border-[#A8D3BC]',
  };

  return (
    <div className="space-y-4">
      {/* Top Persistent Header Hero */}
      <div className="bg-[#FFFFFF] border border-[#D8D5CD] rounded-lg shadow-xs overflow-hidden">
        {header}

        {/* Horizontal Tab Navigation Bar */}
        <div className="flex items-center gap-1 px-4 border-t border-[#D8D5CD] bg-[#ECEAE4]/60 overflow-x-auto select-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const tone = tab.badgeTone || 'default';

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-[#2457A6] text-[#2457A6] bg-[#FFFFFF]'
                    : 'border-transparent text-[#68717C] hover:text-[#20252B] hover:bg-[#FFFFFF]/50'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-[#2457A6]' : 'text-[#68717C]'}`} />}
                <span>{tab.label}</span>

                {tab.badge !== undefined && tab.badge !== null && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-sm border font-bold ${badgeClasses[tone]}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tab Body Container */}
      <div className="min-h-[400px]">{children}</div>
    </div>
  );
};
