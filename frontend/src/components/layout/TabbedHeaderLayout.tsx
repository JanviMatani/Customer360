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
    default: 'bg-gray-100 text-gray-700 border-gray-300',
    blue: 'bg-blue-50 text-[#1B4FD8] border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    crimson: 'bg-red-50 text-red-700 border-red-200',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  return (
    <div className="h-full flex flex-col overflow-hidden gap-3">
      {/* Top Persistent Header Hero */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden shrink-0 flex flex-col">
        {header}

        {/* Horizontal Tab Navigation Bar */}
        <div className="flex items-center gap-1 px-4 border-t border-gray-200 bg-gray-50 overflow-x-auto select-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const tone = tab.badgeTone || 'default';

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-[#1B4FD8] text-[#1B4FD8] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                {Icon && <Icon size={14} className={isActive ? 'text-[#1B4FD8]' : 'text-gray-400'} />}
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

      {/* Dynamic Tab Body Container - strictly locked to flex-1 viewport scrolling */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {children}
      </div>
    </div>
  );
};
