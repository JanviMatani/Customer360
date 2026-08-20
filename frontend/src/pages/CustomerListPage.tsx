import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, ArrowRight } from 'lucide-react';
import { useCustomers } from '../hooks/useCustomers';
import { ConfidenceBadge } from '../components/shared/ConfidenceBadge';
import { SourceBadge } from '../components/shared/SourceBadge';
import { MaskedField } from '../components/shared/MaskedField';
import { PaginationBar } from '../components/shared/PaginationBar';
import { formatCurrency } from '../lib/utils';

export const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sourceSystem, setSourceSystem] = useState('');
  const [segment, setSegment] = useState('');
  const [hasOpportunity, setHasOpportunity] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useCustomers({
    search,
    sourceSystem: sourceSystem || undefined,
    segment: segment || undefined,
    hasOpportunity: hasOpportunity ? true : undefined,
    page: currentPage,
    limit: pageSize,
  });

  const customers = data?.customers || [];
  const totalRecords = data?.total || customers.length;
  const totalPages = data?.totalPages || Math.ceil(totalRecords / pageSize) || 1;

  return (
    <div className="h-full flex flex-col gap-4 text-[#1E293B] overflow-hidden">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between shrink-0 bg-white p-4 rounded-lg border border-gray-200 shadow-2xs">
        <div>
          <div className="text-[10px] font-bold text-[#1B4FD8] tracking-wider uppercase">
            GOLDEN REGISTRY
          </div>
          <h2 className="text-base font-bold text-gray-900 leading-tight">
            Unified Customer 360 Database
          </h2>
        </div>
        <div className="px-3 py-1 rounded bg-[#EBF1FA] border border-[#BCD1F0] text-xs font-mono font-bold text-[#1B4FD8]">
          {totalRecords} Active Records
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs shrink-0">
        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Search bar */}
          <div className="col-span-5 relative">
            <Search size={14} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Golden ID, name, PAN, mobile..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-gray-300 bg-gray-50 focus:bg-white focus:border-[#1B4FD8] focus:ring-1 focus:ring-[#1B4FD8] focus:outline-none transition-all"
            />
          </div>

          {/* Source Selector */}
          <div className="col-span-3">
            <select
              value={sourceSystem}
              onChange={(e) => {
                setSourceSystem(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 bg-gray-50 focus:bg-white focus:border-[#1B4FD8] focus:outline-none transition-all"
            >
              <option value="">All Source Systems</option>
              <option value="equity">Equity Brokerage</option>
              <option value="mf">Mutual Funds</option>
              <option value="insurance">Insurance Shield</option>
              <option value="loans">Credit & Loans</option>
              <option value="wealth">Private Wealth</option>
            </select>
          </div>

          {/* Segment Selector */}
          <div className="col-span-2">
            <select
              value={segment}
              onChange={(e) => {
                setSegment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 bg-gray-50 focus:bg-white focus:border-[#1B4FD8] focus:outline-none transition-all"
            >
              <option value="">All Segments</option>
              <option value="HNI">HNI Tier</option>
              <option value="Retail">Retail</option>
              <option value="Mass Affluent">Mass Affluent</option>
              <option value="Ultra HNI">Ultra HNI</option>
            </select>
          </div>

          {/* Checkbox Toggle */}
          <div className="col-span-2 flex justify-end">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasOpportunity}
                onChange={(e) => {
                  setHasOpportunity(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded border-gray-300 text-[#1B4FD8] focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Has Opportunities</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Table Grid Card */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-2xs flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto min-h-0 relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#F8FAFC] border-b border-gray-200 z-10">
              <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-2.5 px-4 font-mono">Golden ID</th>
                <th className="py-2.5 px-4">Name & Customer Segment</th>
                <th className="py-2.5 px-4">PII Verification (Masked)</th>
                <th className="py-2.5 px-4">Ingested Sources</th>
                <th className="py-2.5 px-4 text-right">Relationship TRV</th>
                <th className="py-2.5 px-4 text-center">Engine Confidence</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-mono">
                    Querying records cache...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No matching golden records found.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => {
                  const sources = cust.sourceSystems || cust.linkedSources || [];
                  const confidence = cust.confidenceScore ?? cust.matchConfidence;
                  return (
                    <tr
                      key={cust.goldenId}
                      onClick={() => navigate(`/customers/${cust.goldenId}`)}
                      className="trow cursor-pointer"
                    >
                      <td className="py-2.5 px-4 font-mono font-bold text-[#1B4FD8]">
                        {cust.goldenId}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-gray-900">{cust.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          {cust.segment} • Risk: {cust.riskProfile || 'Low'}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="space-y-0.5 font-mono text-[10px]">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">PAN:</span>
                            <MaskedField value={cust.pan} type="pan" />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">MOB:</span>
                            <MaskedField value={cust.mobile} type="mobile" />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {sources.map((s, i) => (
                            <SourceBadge key={i} source={s} size="sm" />
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(cust.totalRelationshipValue)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <ConfidenceBadge score={confidence} decision={cust.matchDecision} size="sm" />
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/customers/${cust.goldenId}`);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-[#1B4FD8] hover:text-white border border-[#BCD1F0] text-[#1B4FD8] text-2xs font-bold transition-all cursor-pointer"
                        >
                          <span>Analyze</span>
                          <ArrowRight size={10} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Sticky footer pagination */}
        <div className="border-t border-gray-200 shrink-0 bg-white">
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalRecords}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>
    </div>
  );
};
