import React from 'react';

interface MasterDetailLayoutProps {
  listPane: React.ReactNode;
  detailPane: React.ReactNode;
  listWidthClass?: string;
  emptyState?: React.ReactNode;
  hasSelection?: boolean;
}

export const MasterDetailLayout: React.FC<MasterDetailLayoutProps> = ({
  listPane,
  detailPane,
  listWidthClass = 'w-full lg:w-[320px] xl:w-[360px]',
  emptyState,
  hasSelection = true,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-5 items-stretch min-h-[calc(100vh-210px)] max-h-[calc(100vh-170px)]">
      {/* Left List Rail (Fixed width, independent scroll container) */}
      <div
        className={`${listWidthClass} shrink-0 bg-[#FFFFFF] border border-[#D8D5CD] rounded-lg shadow-xs flex flex-col overflow-hidden`}
      >
        {listPane}
      </div>

      {/* Right Detail Pane (Fluid width, independent scroll container) */}
      <div className="flex-1 min-w-0 bg-[#FFFFFF] border border-[#D8D5CD] rounded-lg shadow-xs flex flex-col overflow-hidden">
        {hasSelection ? (
          detailPane
        ) : (
          emptyState || (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[#68717C]">
              <div className="text-sm font-medium">Select an item from the list to view full details</div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
