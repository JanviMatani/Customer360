import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#FFFFFF] border-t border-[#D8D5CD] text-xs text-[#68717C] select-none">
      {/* Records Count & Page Size Selector */}
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-[#20252B] font-mono">{startItem}</strong>–
          <strong className="text-[#20252B] font-mono">{endItem}</strong> of{' '}
          <strong className="text-[#20252B] font-mono">{totalItems}</strong> records
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[11px] text-[#68717C]">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="px-2 py-1 rounded bg-[#FFFFFF] border border-[#D8D5CD] text-[#20252B] text-xs focus:border-[#2457A6] focus:outline-hidden cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title="First Page"
          className="p-1.5 rounded-md border border-[#D8D5CD] bg-[#FFFFFF] hover:bg-[#F4F2ED] disabled:opacity-35 disabled:hover:bg-[#FFFFFF] text-[#20252B] transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Previous Page"
          className="p-1.5 rounded-md border border-[#D8D5CD] bg-[#FFFFFF] hover:bg-[#F4F2ED] disabled:opacity-35 disabled:hover:bg-[#FFFFFF] text-[#20252B] transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="px-3 py-1 font-mono text-[11px] font-semibold text-[#20252B] bg-[#ECEAE4] rounded-md border border-[#D8D5CD]">
          Page {currentPage} of {Math.max(1, totalPages)}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Next Page"
          className="p-1.5 rounded-md border border-[#D8D5CD] bg-[#FFFFFF] hover:bg-[#F4F2ED] disabled:opacity-35 disabled:hover:bg-[#FFFFFF] text-[#20252B] transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          title="Last Page"
          className="p-1.5 rounded-md border border-[#D8D5CD] bg-[#FFFFFF] hover:bg-[#F4F2ED] disabled:opacity-35 disabled:hover:bg-[#FFFFFF] text-[#20252B] transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
