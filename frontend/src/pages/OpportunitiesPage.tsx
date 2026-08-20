import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  Filter,
  CheckCircle2,
  Search,
  ArrowRight,
  LayoutGrid,
  ListFilter,
  User,
  Building2,
  Sliders,
  DollarSign,
  Percent,
} from 'lucide-react';
import { useOpportunities, useUpdateOpportunityStatus } from '../hooks/useOpportunities';
import { OpportunityCard } from '../components/opportunity/OpportunityCard';
import { PaginationBar } from '../components/shared/PaginationBar';
import { formatCurrency } from '../lib/utils';
import { OpportunityProduct, OpportunityStatus } from '../types';
import { useAuthStore } from '../store/authStore';
import confetti from 'canvas-confetti';

export const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const updateStatusMutation = useUpdateOpportunityStatus();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [productFilter, setProductFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [queueScope, setQueueScope] = useState<'my' | 'team' | 'all'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useOpportunities({
    product: productFilter || undefined,
    status: statusFilter || undefined,
    rmId: queueScope === 'my' && user?.role === 'rm' ? user.rmId : undefined,
  });

  const rawOpportunities = data?.opportunities || [];

  const filteredOpportunities = rawOpportunities.filter((opp) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const reasonsText = opp.reasons?.map((r) => r.label).join(' ') || '';
    return (
      opp.product.toLowerCase().includes(q) ||
      opp.customerName?.toLowerCase().includes(q) ||
      opp.goldenId?.toLowerCase().includes(q) ||
      reasonsText.toLowerCase().includes(q)
    );
  });

  const totalCount = filteredOpportunities.length;
  const totalPipelineValue = filteredOpportunities.reduce((sum, opp) => sum + (opp.potentialValue || 0), 0);
  const avgPropensity =
    totalCount > 0
      ? Math.round(filteredOpportunities.reduce((sum, opp) => sum + opp.score, 0) / totalCount)
      : 84;
  const convertedCount = filteredOpportunities.filter((o) => o.status === 'converted').length;

  const paginatedOpps = filteredOpportunities.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleQuickStatus = async (id: string, status: OpportunityStatus) => {
    await updateStatusMutation.mutateAsync({ id, status });
    if (status === 'converted') {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#D8D5CD]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[#20252B] uppercase tracking-tight">
              Next-Best-Opportunity Engine
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#EBF1FA] border border-[#BCD1F0] text-[#2457A6] font-mono font-semibold">
              {totalCount} Active Leads
            </span>
          </div>
          <p className="text-xs text-[#68717C]">
            Rule-driven cross-sell and up-sell intelligence generated from real-time multi-silo customer holdings.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#ECEAE4] border border-[#D8D5CD] rounded-md shrink-0">
          <button
            onClick={() => setViewMode('table')}
            title="Data Table View"
            className={`p-1.5 rounded transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-[#FFFFFF] text-[#2457A6] shadow-xs' : 'text-[#68717C] hover:text-[#20252B]'
            }`}
          >
            <ListFilter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            title="Card Grid View"
            className={`p-1.5 rounded transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-[#FFFFFF] text-[#2457A6] shadow-xs' : 'text-[#68717C] hover:text-[#20252B]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Top Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
          <div className="flex items-center justify-between text-[#68717C] text-[11px] font-semibold uppercase">
            <span>Qualified Leads</span>
            <Sparkles className="w-3.5 h-3.5 text-[#2457A6]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#20252B] mt-1">{totalCount}</div>
          <div className="text-[10px] text-[#68717C]">High Propensity Cross-Sell</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
          <div className="flex items-center justify-between text-[#68717C] text-[11px] font-semibold uppercase">
            <span>Pipeline Value</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#287A52]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#287A52] mt-1">
            {formatCurrency(totalPipelineValue)}
          </div>
          <div className="text-[10px] text-[#68717C]">Estimated Total Potential</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
          <div className="flex items-center justify-between text-[#68717C] text-[11px] font-semibold uppercase">
            <span>Avg Propensity</span>
            <Percent className="w-3.5 h-3.5 text-[#2457A6]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#2457A6] mt-1">{avgPropensity}%</div>
          <div className="text-[10px] text-[#68717C]">Algorithmic Confidence</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
          <div className="flex items-center justify-between text-[#68717C] text-[11px] font-semibold uppercase">
            <span>Conversions</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#287A52]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#287A52] mt-1">{convertedCount}</div>
          <div className="text-[10px] text-[#68717C]">Won in Current Cycle</div>
        </div>
      </div>

      {/* Role Queue Switcher & Filter Toolbar */}
      <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-3">
        {/* Top Filter Line: Queue Scope & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#ECEAE4] border border-[#D8D5CD] rounded-md">
            {[
              { id: 'my', label: 'My Assigned Leads', icon: User },
              { id: 'team', label: 'Territory Leads', icon: Building2 },
              { id: 'all', label: 'All Bank Leads', icon: Sliders },
            ].map((scope) => {
              const Icon = scope.icon;
              return (
                <button
                  key={scope.id}
                  onClick={() => {
                    setQueueScope(scope.id as any);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    queueScope === scope.id
                      ? 'bg-[#2457A6] text-white shadow-xs'
                      : 'text-[#68717C] hover:text-[#20252B]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{scope.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#68717C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, product, reason..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-xs text-[#20252B] focus:border-[#2457A6] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Bottom Filter Line: Product & Status Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#D8D5CD]">
          {/* Product Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-semibold text-[#68717C] uppercase mr-1">Product:</span>
            {[
              { id: '', label: 'All' },
              { id: 'insurance', label: '🛡️ Insurance' },
              { id: 'wealth', label: '💎 Wealth' },
              { id: 'loans', label: '💳 Loans/LAS' },
              { id: 'mf', label: '📊 Mutual Funds' },
              { id: 'equity', label: '📈 Demat' },
            ].map((prod) => (
              <button
                key={prod.id}
                onClick={() => {
                  setProductFilter(prod.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  productFilter === prod.id
                    ? 'bg-[#2457A6] text-white shadow-xs'
                    : 'bg-[#ECEAE4] text-[#68717C] hover:text-[#20252B] border border-[#D8D5CD]'
                }`}
              >
                {prod.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#68717C] uppercase mr-1">Status:</span>
            {[
              { id: '', label: 'All' },
              { id: 'new', label: 'New' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'converted', label: 'Converted' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setStatusFilter(st.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-[#2457A6] text-white shadow-xs'
                    : 'bg-[#ECEAE4] text-[#68717C] hover:text-[#20252B] border border-[#D8D5CD]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area: Table vs Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[#68717C] font-mono text-xs">
          Querying qualified cross-sell opportunities...
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="p-12 rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] text-center space-y-2 shadow-xs">
          <Sparkles className="w-8 h-8 text-[#2457A6] mx-auto opacity-70" />
          <div className="text-sm font-bold text-[#20252B]">
            No opportunities match the selected filters.
          </div>
          <div className="text-xs text-[#68717C]">Try clearing search or changing the product filter.</div>
        </div>
      ) : viewMode === 'table' ? (
        /* DATA TABLE WORK QUEUE VIEW */
        <div className="rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D8D5CD] bg-[#ECEAE4] text-[#68717C] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 font-mono text-[11px]">Opp ID</th>
                  <th className="py-3 px-4 text-[11px]">Customer & Target Product</th>
                  <th className="py-3 px-4 text-[11px]">Explainable Trigger / Rationale</th>
                  <th className="py-3 px-4 text-center text-[11px]">Propensity</th>
                  <th className="py-3 px-4 text-right text-[11px]">Potential Value</th>
                  <th className="py-3 px-4 text-center text-[11px]">Status</th>
                  <th className="py-3 px-4 text-right text-[11px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D5CD] text-[#20252B]">
                {paginatedOpps.map((opp) => (
                  <tr
                    key={opp.id}
                    id={`opp-table-row-${opp.id}`}
                    className="hover:bg-[#F4F2ED] transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#2457A6] whitespace-nowrap">
                      {opp.id}
                    </td>

                    <td className="py-3 px-4">
                      <div
                        onClick={() => navigate(`/customers/${opp.goldenCustomerId || opp.goldenId}`)}
                        className="font-bold text-[#20252B] hover:text-[#2457A6] cursor-pointer"
                      >
                        {opp.customerName || opp.goldenId}
                      </div>
                      <div className="text-[11px] text-[#68717C] flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-[#20252B] uppercase">{opp.product}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-[11px] text-[#68717C] leading-snug line-clamp-2">
                        {opp.reasons?.map((r) => r.label).join(' • ') || 'Multi-silo portfolio match'}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#EBF1FA] text-[#2457A6] border border-[#BCD1F0]">
                        {opp.score}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-[#287A52] text-xs whitespace-nowrap">
                      {formatCurrency(opp.potentialValue)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {opp.status === 'new' && (
                        <span className="px-2 py-0.5 rounded bg-[#EBF1FA] text-[#2457A6] border border-[#BCD1F0] text-[10px] font-bold uppercase">
                          NEW
                        </span>
                      )}
                      {opp.status === 'in_progress' && (
                        <span className="px-2 py-0.5 rounded bg-[#FBF4EB] text-[#A66A16] border border-[#E8CEAB] text-[10px] font-bold uppercase">
                          IN PROGRESS
                        </span>
                      )}
                      {opp.status === 'converted' && (
                        <span className="px-2 py-0.5 rounded bg-[#EBF4EF] text-[#287A52] border border-[#A8D3BC] text-[10px] font-bold uppercase">
                          CONVERTED
                        </span>
                      )}
                      {opp.status === 'dismissed' && (
                        <span className="px-2 py-0.5 rounded bg-[#ECEAE4] text-[#68717C] border border-[#D8D5CD] text-[10px] font-bold uppercase">
                          DISMISSED
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {opp.status === 'new' && (
                          <button
                            onClick={() => handleQuickStatus(opp.id, 'in_progress')}
                            className="px-2.5 py-1 rounded bg-[#EBF1FA] hover:bg-[#2457A6] hover:text-white border border-[#BCD1F0] text-[#2457A6] text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Initiate
                          </button>
                        )}
                        {opp.status === 'in_progress' && (
                          <button
                            onClick={() => handleQuickStatus(opp.id, 'converted')}
                            className="px-2.5 py-1 rounded bg-[#287A52] hover:bg-[#1E5C3E] text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Convert
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/customers/${opp.goldenCustomerId || opp.goldenId}`)}
                          className="px-2.5 py-1 rounded bg-[#ECEAE4] hover:bg-[#D8D5CD] text-[#20252B] border border-[#D8D5CD] text-xs font-semibold cursor-pointer"
                        >
                          Profile 360 →
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationBar
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / pageSize) || 1}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedOpps.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onViewProfile={() => navigate(`/customers/${opp.goldenCustomerId || opp.goldenId}`)}
              />
            ))}
          </div>

          <PaginationBar
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / pageSize) || 1}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
    </div>
  );
};
