import React, { useState } from 'react';
import {
  GitMerge,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ShieldAlert,
  Search,
  Clock,
  Check,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useReviewQueue } from '../hooks/useReview';
import { ReviewComparisonCard } from '../components/identity/ReviewComparisonCard';
import { MasterDetailLayout } from '../components/layout/MasterDetailLayout';
import { SourceBadge } from '../components/shared/SourceBadge';
import { ConfidenceBadge } from '../components/shared/ConfidenceBadge';
import { PaginationBar } from '../components/shared/PaginationBar';
import { ReviewItem } from '../types';
import { formatDateTime } from '../lib/utils';

export const ReviewQueuePage: React.FC = () => {
  const [activeQueueTab, setActiveQueueTab] = useState<'pending' | 'dangerous' | 'resolved'>('pending');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvedPage, setResolvedPage] = useState(1);
  const [resolvedPageSize, setResolvedPageSize] = useState(10);

  // Fetch pending review items
  const { data: pendingData, isLoading: isPendingLoading } = useReviewQueue('pending');
  // Fetch all items for dangerous and resolved calculations
  const { data: allData, isLoading: isAllLoading } = useReviewQueue('all');

  const pendingItems = pendingData?.items || [];
  const allItems = allData?.items || [];

  const dangerousItems = allItems.filter((i) => i.isDangerousConflict);
  const resolvedItems = allItems.filter((i) => i.decision !== 'pending');

  const displayedList: ReviewItem[] =
    activeQueueTab === 'pending'
      ? pendingItems
      : activeQueueTab === 'dangerous'
      ? dangerousItems
      : resolvedItems;

  const filteredList = displayedList.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      (item.candidateName && item.candidateName.toLowerCase().includes(q)) ||
      item.sourceA.system.toLowerCase().includes(q) ||
      item.sourceB.system.toLowerCase().includes(q)
    );
  });

  // Auto-select first item if none selected or selected item is out of view
  const currentSelected =
    filteredList.find((i) => i.id === selectedItemId) || filteredList[0] || null;

  return (
    <div className="space-y-5">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#D8D5CD]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[#20252B] uppercase tracking-tight">
              Identity Match Review Queue
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#FBF4EB] border border-[#E8CEAB] text-[#A66A16] font-mono font-semibold">
              {pendingItems.length} Pending Actions
            </span>
          </div>
          <p className="text-xs text-[#68717C]">
            Ambiguous identity candidates (60–84% confidence) and critical identifier conflicts requiring manual operator signoff.
          </p>
        </div>
      </div>

      {/* Top 4 Stat Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E8CEAB] shadow-xs">
          <div className="flex items-center justify-between text-[#A66A16] text-[11px] font-semibold uppercase">
            <span>Pending Review</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="font-mono text-xl font-bold text-[#A66A16] mt-1">{pendingItems.length}</div>
          <div className="text-[10px] text-[#68717C]">60–84% Confidence Score</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E8B8B8] shadow-xs">
          <div className="flex items-center justify-between text-[#B84242] text-[11px] font-semibold uppercase">
            <span>Dangerous Conflicts</span>
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div className="font-mono text-xl font-bold text-[#B84242] mt-1">{dangerousItems.length}</div>
          <div className="text-[10px] text-[#68717C]">Hard Rule Blocked</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#A8D3BC] shadow-xs">
          <div className="flex items-center justify-between text-[#287A52] text-[11px] font-semibold uppercase">
            <span>Resolved Historical</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="font-mono text-xl font-bold text-[#287A52] mt-1">{resolvedItems.length}</div>
          <div className="text-[10px] text-[#68717C]">Operator Verified</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
          <div className="flex items-center justify-between text-[#68717C] text-[11px] font-semibold uppercase">
            <span>Avg Resolution Time</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="font-mono text-xl font-bold text-[#20252B] mt-1">1.8m</div>
          <div className="text-[10px] text-[#68717C]">SLA: &lt; 5 minutes</div>
        </div>
      </div>

      {/* Mode Tabs & Search Filter Strip */}
      <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#ECEAE4] border border-[#D8D5CD] rounded-md overflow-x-auto">
          {[
            { id: 'pending', label: 'Pending Review', count: pendingItems.length },
            { id: 'dangerous', label: 'Dangerous Conflicts', count: dangerousItems.length },
            { id: 'resolved', label: 'Resolved History', count: resolvedItems.length },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`queue-tab-${tab.id}`}
              onClick={() => {
                setActiveQueueTab(tab.id as any);
                setSelectedItemId(null);
              }}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeQueueTab === tab.id
                  ? 'bg-[#2457A6] text-white shadow-xs'
                  : 'text-[#68717C] hover:text-[#20252B]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded-sm ${
                  activeQueueTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#D8D5CD] text-[#20252B]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#68717C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter queue candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-xs text-[#20252B] focus:border-[#2457A6] focus:outline-hidden"
          />
        </div>
      </div>

      {/* MASTER-DETAIL WORKSPACE */}
      {activeQueueTab !== 'resolved' ? (
        <MasterDetailLayout
          listWidthClass="w-full lg:w-[320px] xl:w-[350px]"
          listPane={
            <div className="flex flex-col h-full">
              <div className="p-3 border-b border-[#D8D5CD] bg-[#ECEAE4] text-[11px] font-bold uppercase tracking-wider text-[#68717C] flex items-center justify-between">
                <span>Candidates List</span>
                <span className="font-mono text-[#20252B]">{filteredList.length} items</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#D8D5CD]">
                {filteredList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#68717C]">
                    No review items in this queue.
                  </div>
                ) : (
                  filteredList.map((item) => {
                    const isSelected = currentSelected?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        id={`queue-item-card-${item.id}`}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`p-3.5 transition-all cursor-pointer text-xs space-y-2 select-none ${
                          isSelected
                            ? 'bg-[#EBF1FA] border-l-4 border-l-[#2457A6]'
                            : 'hover:bg-[#F4F2ED]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#2457A6] text-[11px]">
                            {item.id}
                          </span>
                          <ConfidenceBadge score={item.confidence} size="sm" />
                        </div>

                        <div className="font-bold text-sm text-[#20252B] truncate">
                          {item.candidateName || 'Candidate Pair'}
                        </div>

                        <div className="flex items-center gap-1">
                          <SourceBadge source={item.sourceA.system} size="sm" />
                          <span className="text-[10px] text-[#68717C]">↔</span>
                          <SourceBadge source={item.sourceB.system} size="sm" />
                        </div>

                        {item.isDangerousConflict && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-[#B84242] bg-[#F9ECEC] px-2 py-0.5 rounded border border-[#E8B8B8]">
                            <ShieldAlert className="w-3 h-3 shrink-0" />
                            <span className="truncate">Critical Conflict</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          }
          hasSelection={!!currentSelected}
          detailPane={
            currentSelected ? (
              <div className="p-4 sm:p-6 overflow-y-auto">
                <ReviewComparisonCard item={currentSelected} />
              </div>
            ) : null
          }
        />
      ) : (
        /* RESOLVED HISTORY TABLE VIEW */
        <div className="rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D8D5CD] bg-[#ECEAE4] text-[#68717C] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 font-mono text-[11px]">Queue ID</th>
                  <th className="py-3 px-4 text-[11px]">Candidate Pair</th>
                  <th className="py-3 px-4 text-[11px]">Silos Compared</th>
                  <th className="py-3 px-4 text-center text-[11px]">Score</th>
                  <th className="py-3 px-4 text-[11px]">Decision</th>
                  <th className="py-3 px-4 text-[11px]">Reviewer & Timestamp</th>
                  <th className="py-3 px-4 text-[11px]">Resolution Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D5CD] text-[#20252B]">
                {resolvedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#68717C]">
                      No historical resolved review actions recorded yet.
                    </td>
                  </tr>
                ) : (
                  resolvedItems
                    .slice((resolvedPage - 1) * resolvedPageSize, resolvedPage * resolvedPageSize)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-[#F4F2ED]">
                        <td className="py-3 px-4 font-mono font-bold text-[#2457A6]">{item.id}</td>
                        <td className="py-3 px-4 font-bold text-[#20252B]">{item.candidateName}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <SourceBadge source={item.sourceA.system} size="sm" />
                            <span className="text-[10px] text-[#68717C]">↔</span>
                            <SourceBadge source={item.sourceB.system} size="sm" />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <ConfidenceBadge score={item.confidence} size="sm" />
                        </td>
                        <td className="py-3 px-4">
                          {item.decision === 'approved' ? (
                            <span className="px-2 py-0.5 rounded bg-[#EBF4EF] border border-[#A8D3BC] text-[#287A52] font-bold text-[10px] uppercase">
                              Merged
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-[#F9ECEC] border border-[#E8B8B8] text-[#B84242] font-bold text-[10px] uppercase">
                              Separated
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[11px]">
                          <div className="font-semibold text-[#20252B]">{item.reviewedBy || 'Operator'}</div>
                          <div className="text-[10px] text-[#68717C] font-mono">
                            {formatDateTime(item.reviewedAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-[#68717C] italic max-w-xs truncate">
                          "{item.note || 'Resolved'}"
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          <PaginationBar
            currentPage={resolvedPage}
            totalPages={Math.ceil(resolvedItems.length / resolvedPageSize) || 1}
            totalItems={resolvedItems.length}
            pageSize={resolvedPageSize}
            onPageChange={setResolvedPage}
            onPageSizeChange={setResolvedPageSize}
          />
        </div>
      )}
    </div>
  );
};
