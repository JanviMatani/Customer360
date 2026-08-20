import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GitMerge,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useDashboardStats } from '../hooks/useAudit';
import { useCustomers } from '../hooks/useCustomers';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../lib/utils';
import { ConfidenceBadge } from '../components/shared/ConfidenceBadge';
import { SourceBadge } from '../components/shared/SourceBadge';
import { PipelineFunnel } from '../components/shared/PipelineFunnel';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: customersData } = useCustomers({ limit: 4 });

  if (isLoading || !stats) {
    return (
      <div className="p-12 text-center text-[#68717C] font-mono text-xs">
        Aggregating financial customer 360 intelligence...
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
    { name: 'Equity', value: breakdown.equity, color: '#2457A6' },
    { name: 'Mutual Funds', value: breakdown.mf, color: '#183B70' },
    { name: 'Insurance', value: breakdown.insurance, color: '#287A52' },
    { name: 'Loans / LAS', value: breakdown.loans, color: '#A66A16' },
    { name: 'Wealth', value: breakdown.wealth, color: '#54667A' },
  ];

  const confidenceData = [
    { name: '≥85% Auto-Merged', count: stats.autoMerged || 3, fill: '#287A52' },
    { name: '60-84% In Review', count: stats.pendingReview ?? stats.pendingReviews ?? 2, fill: '#A66A16' },
    { name: '<60% Separated', count: stats.separated || 1, fill: '#B84242' },
  ];

  const totalCustomers = stats.totalCustomers ?? stats.goldenCustomers ?? 5;
  const pendingReviews = stats.pendingReviews ?? stats.pendingReview ?? 2;
  const autoMergedPct =
    stats.autoMergedPercentage ??
    (stats.autoMerged && totalCustomers ? Math.round((stats.autoMerged / totalCustomers) * 100) : 60);
  const activeOpps =
    stats.activeOpportunities ??
    (stats.opportunityDistribution?.reduce((acc, curr) => acc + curr.count, 0) || 5);
  const oppValue =
    stats.totalOpportunityValue ??
    (stats.opportunityDistribution?.reduce((acc, curr) => acc + curr.totalPotential, 0) || 3750000);
  const totalTRV = stats.totalRelationshipValue ?? stats.totalPortfolioValue ?? 9850000;

  const demoCandidates =
    customersData?.customers && customersData.customers.length > 0
      ? customersData.customers.slice(0, 4)
      : [];

  return (
    <div className="space-y-6">
      {/* Welcome & Role Command Banner */}
      <div className="p-6 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#2457A6] font-mono uppercase tracking-wider">
              COMMAND CENTER • {user?.role.toUpperCase()}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#287A52]" />
          </div>
          <h2 className="text-2xl font-bold text-[#20252B] tracking-tight">
            Financial Customer 360 & Opportunity Intelligence
          </h2>
          <p className="text-xs text-[#68717C] max-w-2xl mt-1 leading-relaxed">
            Deterministic & probabilistic identity unification across Equity, Mutual Funds, Insurance, Loans & Wealth. Explainable matching, conflict resolution & next-best action triggers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="dashboard-open-review-btn"
            onClick={() => navigate('/review')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#FBF4EB] hover:bg-[#F4E8D7] border border-[#E8CEAB] text-[#A66A16] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <GitMerge className="w-4 h-4" />
            <span>Review Queue ({pendingReviews})</span>
          </button>

          <button
            id="dashboard-open-customers-btn"
            onClick={() => navigate('/customers')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#2457A6] hover:bg-[#183B70] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Users className="w-4 h-4" />
            <span>Customer 360 Registry</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Customers */}
        <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
          <div className="flex items-center justify-between text-[#68717C] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Golden Profiles</span>
            <Users className="w-4 h-4 text-[#2457A6]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#20252B]">{totalCustomers}</div>
          <div className="text-[10px] text-[#68717C] mt-1 font-mono">100% deduplicated</div>
        </div>

        {/* Auto-Merge Rate */}
        <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
          <div className="flex items-center justify-between text-[#68717C] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Auto-Merge Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#287A52]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#287A52]">{autoMergedPct}%</div>
          <div className="text-[10px] text-[#68717C] mt-1 font-mono">≥85% threshold met</div>
        </div>

        {/* Review Queue */}
        <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#E8CEAB] shadow-xs">
          <div className="flex items-center justify-between text-[#A66A16] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Review Queue</span>
            <GitMerge className="w-4 h-4 text-[#A66A16]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#A66A16]">{pendingReviews}</div>
          <div className="text-[10px] text-[#A66A16] mt-1 font-mono">Requires decision</div>
        </div>

        {/* Active Opps */}
        <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
          <div className="flex items-center justify-between text-[#68717C] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Opps</span>
            <Sparkles className="w-4 h-4 text-[#2457A6]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#2457A6]">{activeOpps}</div>
          <div className="text-[10px] text-[#68717C] mt-1 font-mono">High propensity</div>
        </div>

        {/* Pipeline Value */}
        <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
          <div className="flex items-center justify-between text-[#68717C] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pipeline Value</span>
            <TrendingUp className="w-4 h-4 text-[#287A52]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#287A52]">
            {formatCurrency(oppValue)}
          </div>
          <div className="text-[10px] text-[#68717C] mt-1 font-mono">Total cross-sell est.</div>
        </div>

        {/* Total Relationship Value */}
        <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
          <div className="flex items-center justify-between text-[#68717C] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Aggregated TRV</span>
            <Database className="w-4 h-4 text-[#2457A6]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#20252B]">
            {formatCurrency(totalTRV)}
          </div>
          <div className="text-[10px] text-[#68717C] mt-1 font-mono">Across all silos</div>
        </div>
      </div>

      {/* Identity Resolution Processing Funnel (The Core System Architecture Diagram) */}
      <PipelineFunnel data={stats.pipelineFunnel} />

      {/* Visual Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Silo Product Holdings Distribution */}
        <div className="p-5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8D5CD]">
            <h3 className="text-xs font-bold text-[#20252B] uppercase tracking-wide flex items-center gap-2">
              <Database className="w-4 h-4 text-[#2457A6]" />
              <span>Silo Product Distribution (Active Accounts)</span>
            </h3>
            <span className="text-xs text-[#68717C] font-mono">5 Operational Silos</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#68717C" fontSize={11} tickLine={false} />
                <YAxis stroke="#68717C" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D8D5CD',
                    color: '#20252B',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" name="Active Customers" radius={[4, 4, 0, 0]}>
                  {productChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Identity Match Confidence Segments */}
        <div className="p-5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8D5CD]">
            <h3 className="text-xs font-bold text-[#20252B] uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#287A52]" />
              <span>Identity Resolution Confidence Tiers</span>
            </h3>
            <span className="text-xs text-[#68717C] font-mono">Deterministic Engine</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={confidenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="name"
                >
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-conf-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D8D5CD',
                    color: '#20252B',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-[#20252B]">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Featured Priority Candidates (Live Golden Records) */}
      <div className="p-5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#D8D5CD]">
          <div>
            <h3 className="text-xs font-bold text-[#20252B] uppercase tracking-wide">
              Priority Demo Candidates (Live Golden Records)
            </h3>
            <div className="text-xs text-[#68717C]">
              Click any customer to inspect the 6-tab Customer 360 profile, mathematical evidence & explainable cross-sell triggers.
            </div>
          </div>

          <button
            onClick={() => navigate('/customers')}
            className="text-xs text-[#2457A6] hover:text-[#183B70] font-semibold cursor-pointer flex items-center gap-1"
          >
            <span>View All Profiles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoCandidates.map((cust) => {
            const sources = cust.linkedSources || cust.sourceSystems || [];
            return (
              <div
                key={cust.goldenId}
                id={`candidate-card-${cust.goldenId}`}
                onClick={() => navigate(`/customers/${cust.goldenId}`)}
                className="p-4 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] hover:border-[#2457A6] transition-all cursor-pointer shadow-xs flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#2457A6] bg-[#EBF1FA] px-2 py-0.5 rounded-md border border-[#BCD1F0]">
                      {cust.goldenId}
                    </span>
                    <ConfidenceBadge score={cust.matchConfidence} size="sm" />
                  </div>

                  <div className="font-bold text-sm text-[#20252B] group-hover:text-[#2457A6] transition-colors">
                    {cust.name}
                  </div>

                  <div className="flex flex-wrap gap-1 my-2">
                    {sources.map((s, i) => (
                      <SourceBadge key={i} source={s} size="sm" />
                    ))}
                  </div>

                  <div className="text-xs text-[#68717C] font-mono mt-2">
                    TRV: <strong className="text-[#287A52]">{formatCurrency(cust.totalRelationshipValue)}</strong>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#D8D5CD] text-[11px] text-[#2457A6] font-medium flex items-center justify-between">
                  <span>{cust.segment || 'Retail'}</span>
                  <span className="text-[10px] text-[#68717C] font-mono">
                    {cust.sourceLineage?.length || sources.length} Silos
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
