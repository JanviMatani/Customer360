import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GitMerge,
  Sparkles,
  TrendingUp,
  Database,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { useDashboardStats } from '../hooks/useAudit';
import { useCustomers } from '../hooks/useCustomers';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../lib/utils';
import { ConfidenceBadge } from '../components/shared/ConfidenceBadge';
import { SourceBadge } from '../components/shared/SourceBadge';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: customersData } = useCustomers({ limit: 3 });

  if (isLoading || !stats) {
    return (
      <div className="h-full flex items-center justify-center text-xs font-mono text-gray-500">
        Aggregating system telemetry data...
      </div>
    );
  }

  const breakdown = stats.productsBreakdown || {
    equity: 3,
    mf: 4,
    insurance: 2,
    loans: 2,
    wealth: 1,
  };

  const productChartData = [
    { name: 'Equity', value: breakdown.equity, color: '#1B4FD8' },
    { name: 'Mutual Funds', value: breakdown.mf, color: '#2563EB' },
    { name: 'Insurance', value: breakdown.insurance, color: '#10B981' },
    { name: 'Loans', value: breakdown.loans, color: '#F59E0B' },
    { name: 'Wealth', value: breakdown.wealth, color: '#6366F1' },
  ];

  const totalCustomers = stats.totalCustomers ?? stats.goldenCustomers ?? 5;
  const pendingReviews = stats.pendingReviews ?? stats.pendingReview ?? 2;
  const activeOpps = stats.activeOpportunities ?? 5;
  const oppValue = stats.totalOpportunityValue ?? 3750000;
  const totalTRV = stats.totalRelationshipValue ?? 9850000;

  const demoCandidates = customersData?.customers?.slice(0, 3) || [];

  return (
    <div className="flex flex-col gap-4 text-[#1E293B] flex-1 h-full">
      
      {/* Top Welcome / Header */}
      <div className="flex items-center justify-between shrink-0 bg-white p-4 rounded-lg border border-gray-200">
        <div>
          <div className="text-[10px] font-bold text-[#1B4FD8] tracking-wider uppercase">
            OPERATIONAL COMMAND CENTER
          </div>
          <h2 className="text-base font-bold text-gray-900 leading-tight">
            Golden Record Registry & Opportunity Engine
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/review')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#E8CEAB] bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold cursor-pointer transition-colors"
          >
            <GitMerge size={14} />
            <span>Review Queue ({pendingReviews})</span>
          </button>
          <button
            onClick={() => navigate('/customers')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1B4FD8] hover:bg-[#113CAD] text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <Users size={14} />
            <span>Golden Registry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-5 gap-4 shrink-0">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs kpi-blue">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Golden Records
          </div>
          <div className="font-mono text-xl font-bold text-gray-900 mt-1">
            {totalCustomers}
          </div>
          <div className="text-[9px] text-gray-500 font-mono mt-0.5">100% Deduplicated</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs kpi-green">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Auto-Merge Rate
          </div>
          <div className="font-mono text-xl font-bold text-emerald-700 mt-1">
            {stats.autoMergedPercentage ?? 60}%
          </div>
          <div className="text-[9px] text-gray-500 font-mono mt-0.5">Confidence threshold met</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs kpi-amber">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            System Mismatches
          </div>
          <div className="font-mono text-xl font-bold text-amber-700 mt-1">
            {pendingReviews}
          </div>
          <div className="text-[9px] text-gray-500 font-mono mt-0.5">Awaiting resolution</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs kpi-violet">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Active Propensities
          </div>
          <div className="font-mono text-xl font-bold text-indigo-700 mt-1">
            {activeOpps}
          </div>
          <div className="text-[9px] text-gray-500 font-mono mt-0.5">Pipeline Value: {formatCurrency(oppValue)}</div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs kpi-blue">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Aggregated TRV
          </div>
          <div className="font-mono text-xl font-bold text-gray-900 mt-1">
            {formatCurrency(totalTRV)}
          </div>
          <div className="text-[9px] text-gray-500 font-mono mt-0.5">Total across 5 silos</div>
        </div>
      </div>

      {/* Main Bottom Section (Split-Pane Grid) */}
      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left Column: Silo Distribution (Bar Chart) */}
        <div className="col-span-12 lg:col-span-6 bg-white p-4 rounded-lg border border-gray-200 flex flex-col shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Database size={14} className="text-[#1B4FD8]" />
              <span>Silo Product Holdings</span>
            </h3>
            <span className="text-[10px] font-mono text-gray-400">Real-Time Ingestion</span>
          </div>

          <div className="flex-1 min-h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    fontSize: '11px',
                    borderRadius: '4px',
                  }}
                />
                <Bar dataKey="value" name="Holdings" radius={[3, 3, 0, 0]}>
                  {productChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Live Golden Registry (Table/Cards) */}
        <div className="col-span-12 lg:col-span-6 bg-white p-4 rounded-lg border border-gray-200 flex flex-col shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Priority Customer Registry</span>
            </h3>
            <button
              onClick={() => navigate('/customers')}
              className="text-[10px] text-[#1B4FD8] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Customer list table */}
          <div className="flex-1 overflow-y-auto mt-2 min-h-[250px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-2">Identifier</th>
                  <th className="py-2">Customer Name</th>
                  <th className="py-2">Sources</th>
                  <th className="py-2 text-right">Relationship Value</th>
                  <th className="py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {demoCandidates.map((cust) => {
                  const sources = cust.linkedSources || cust.sourceSystems || [];
                  return (
                    <tr key={cust.goldenId} className="trow">
                      <td className="py-2.5 font-id text-gray-900 font-semibold">{cust.goldenId}</td>
                      <td className="py-2.5">
                        <div className="font-bold text-gray-900">{cust.name}</div>
                        <div className="text-[10px] text-gray-400">{cust.segment || 'HNI'}</div>
                      </td>
                      <td className="py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {sources.map((s, i) => (
                            <SourceBadge key={i} source={s} size="sm" />
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-emerald-700">
                        {formatCurrency(cust.totalRelationshipValue)}
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          onClick={() => navigate(`/customers/${cust.goldenId}`)}
                          className="p-1 rounded hover:bg-blue-50 text-[#1B4FD8] transition-colors"
                          title="View 360 Degree Profile"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
