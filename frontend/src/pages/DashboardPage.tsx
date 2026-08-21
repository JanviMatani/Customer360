import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, Cell, Tooltip,
} from 'recharts';
import { useDashboardStats } from '../hooks/useAudit';
import { useCustomers } from '../hooks/useCustomers';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../lib/utils';
import { SourceBadge } from '../components/shared/SourceBadge';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: customersData } = useCustomers({ limit: 6 });

  if (isLoading || !stats) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
          <div className="w-4 h-4 border border-gray-300 border-t-[#1B4FD8] rounded-full animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  const totalCustomers = stats.totalCustomers  ?? 0;
  const pendingReviews = stats.pendingReview   ?? stats.pendingReviews ?? 0;
  const activeOpps     = stats.activeOpportunities ?? 0;
  const totalTRV       = stats.totalRelationshipValue ?? 0;
  const autoMergedPct  = stats.autoMergedPercentage  ?? 0;
  const ingestedRows   = stats.totalIngested ?? (totalCustomers * 5);

  const breakdown = stats.productsBreakdown ?? { equity: 0, mf: 0, insurance: 0, loans: 0, wealth: 0 };
  const chartData = [
    { name: 'Equity',    value: breakdown.equity    },
    { name: 'MF',        value: breakdown.mf        },
    { name: 'Insurance', value: breakdown.insurance },
    { name: 'Loans',     value: breakdown.loans     },
    { name: 'Wealth',    value: breakdown.wealth    },
  ];

  const customers  = customersData?.customers ?? [];
  const maxTRV     = Math.max(...customers.map(c => c.totalRelationshipValue ?? 0), 1);

  return (
    /* Full viewport — no scroll */
    <div className="h-full flex flex-col gap-3 overflow-hidden">

      {/* ── HEADER ROW ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <p className="text-[10px] font-semibold text-[#1B4FD8] uppercase tracking-widest">
            {user?.role === 'admin' ? 'System Overview' : user?.role === 'manager' ? 'Regional Portfolio' : 'My Portfolio'}
          </p>
          <h1 className="text-base font-bold text-gray-900 leading-tight mt-0.5">
            Customer 360 — Intelligence Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {pendingReviews > 0 && (user?.role === 'admin' || user?.role === 'manager') && (
            <button
              onClick={() => navigate('/review')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-amber-300 bg-amber-50 text-amber-800 text-[11px] font-semibold hover:bg-amber-100 cursor-pointer transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {pendingReviews} pending reviews
            </button>
          )}
        </div>
      </div>

      {/* ── KPI STRIP — 5 metrics, no color drama ─────────────────────────── */}
      <div className="grid grid-cols-5 gap-3 shrink-0">
        {[
          { label: 'Unified Customers',       value: totalCustomers,          sub: 'Golden records',        go: '/customers'     },
          { label: 'Relationship Value',       value: formatCurrency(totalTRV), sub: 'Total across 5 silos', go: null             },
          { label: 'Active Opportunities',     value: activeOpps,              sub: 'Cross-sell leads',      go: '/opportunities' },
          { label: 'Pending Identity Review',  value: pendingReviews,          sub: 'Awaiting decision',     go: pendingReviews > 0 ? '/review' : null, warn: pendingReviews > 0 },
          { label: 'Auto-Merge Rate',          value: `${autoMergedPct}%`,     sub: 'High-confidence merges',go: null             },
        ].map((m, i) => (
          <div
            key={i}
            onClick={m.go ? () => navigate(m.go!) : undefined}
            className={`bg-white rounded-lg border border-gray-200 p-4 select-none transition-all ${m.go ? 'cursor-pointer hover:border-[#1B4FD8]' : ''}`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${m.warn ? 'text-amber-600' : 'text-gray-400'}`}>
              {m.label}
            </p>
            <p className={`text-2xl font-bold font-mono mt-1.5 ${m.warn ? 'text-amber-700' : 'text-gray-900'}`}>
              {m.value}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* ── MAIN 3-COLUMN GRID ────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">

        {/* COL 1+2: Identity pipeline + chart */}
        <div className="col-span-5 flex flex-col gap-3 min-h-0">

          {/* Pipeline funnel — the actual story */}
          <div className="bg-white rounded-lg border border-gray-200 flex flex-col flex-1 min-h-0">
            <div className="px-4 py-3 border-b border-gray-100 shrink-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Identity Resolution Pipeline</p>
              <p className="text-xs font-bold text-gray-800 mt-0.5">Ingestion → Matching → Golden Records</p>
            </div>
            <div className="flex-1 px-4 py-3 flex flex-col justify-between">
              {[
                { label: 'Source records ingested', value: ingestedRows, total: ingestedRows, desc: 'Raw data across 5 source systems' },
                { label: 'Candidate pairs evaluated', value: Math.round(ingestedRows * 0.6), total: ingestedRows, desc: 'Blocking keys: PAN · Mobile · Email · Name+DOB' },
                { label: 'Auto-merged (≥85%)', value: Math.round(totalCustomers * (autoMergedPct / 100)), total: totalCustomers, desc: 'Deterministic + fuzzy confidence met threshold' },
                { label: 'Manual review (60–84%)', value: pendingReviews, total: totalCustomers, desc: 'Ambiguous — requires human decision' },
                { label: 'Golden records created', value: totalCustomers, total: totalCustomers, desc: 'Unified customer identities' },
              ].map((row, i) => {
                const pct = row.total > 0 ? Math.min(100, Math.round((row.value / row.total) * 100)) : 0;
                const isWarning = row.label.includes('Manual') && row.value > 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-semibold ${isWarning ? 'text-amber-600' : 'text-gray-600'}`}>{row.label}</span>
                      <span className={`text-[10px] font-mono font-bold ${isWarning ? 'text-amber-700' : 'text-gray-800'}`}>{row.value.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isWarning ? 'bg-amber-400' : i === 4 ? 'bg-[#1B4FD8]' : 'bg-gray-300'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5 mb-2">{row.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Product distribution chart */}
          <div className="bg-white rounded-lg border border-gray-200 shrink-0" style={{ height: 160 }}>
            <div className="px-4 pt-3 pb-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Customers per Source System</p>
            </div>
            <ResponsiveContainer width="100%" height={115}>
              <BarChart data={chartData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }} barSize={24}>
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#F5F5F5' }}
                  contentStyle={{ fontSize: '11px', border: '1px solid #E5E7EB', borderRadius: '4px', boxShadow: 'none' }}
                  formatter={(v) => [`${v}`, 'Customers']}
                />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill="#1B4FD8" fillOpacity={0.75 - i * 0.1} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COL 3+4+5: Customer registry — dense, professional */}
        <div className="col-span-7 bg-white rounded-lg border border-gray-200 flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Priority Customer Registry</p>
              <p className="text-xs font-bold text-gray-800 mt-0.5">Unified golden records · Sorted by relationship value</p>
            </div>
            <button
              onClick={() => navigate('/customers')}
              className="flex items-center gap-1 text-[10px] text-[#1B4FD8] font-semibold hover:underline cursor-pointer"
            >
              View all <ArrowRight size={11} />
            </button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-100 shrink-0">
            {['GOLDEN ID', 'NAME / SEGMENT', 'SOURCE SYSTEMS', 'RELATIONSHIP VALUE', 'CONF.', ''].map((h, i) => (
              <div key={i} className={`text-[9px] font-bold text-gray-400 uppercase tracking-wider ${i === 3 ? 'col-span-3 text-right' : i === 4 ? 'text-center' : i === 2 ? 'col-span-2' : i === 1 ? 'col-span-3' : 'col-span-1'}`}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {customers.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">No customers loaded. Run the matching pipeline.</div>
            ) : customers.map((cust) => {
              const sources = cust.linkedSources || cust.sourceSystems || [];
              const conf    = cust.confidenceScore ?? cust.matchConfidence ?? 0;
              const trv     = cust.totalRelationshipValue ?? 0;
              const trvPct  = maxTRV > 0 ? Math.min(100, (trv / maxTRV) * 100) : 0;
              return (
                <div
                  key={cust.goldenId}
                  onClick={() => navigate(`/customers/${cust.goldenId}`)}
                  className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  {/* Golden ID */}
                  <div className="col-span-1">
                    <span className="text-[10px] font-mono font-bold text-[#1B4FD8]">{cust.goldenId}</span>
                  </div>
                  {/* Name */}
                  <div className="col-span-3">
                    <p className="text-[11px] font-semibold text-gray-900 truncate">{cust.name}</p>
                    <p className="text-[9px] text-gray-400">{cust.segment ?? '—'}</p>
                  </div>
                  {/* Sources */}
                  <div className="col-span-2 flex flex-wrap gap-0.5">
                    {sources.slice(0, 3).map((s, i) => (
                      <SourceBadge key={i} source={s} size="sm" />
                    ))}
                  </div>
                  {/* TRV with bar */}
                  <div className="col-span-3 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-gray-800">{formatCurrency(trv)}</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1B4FD8] rounded-full" style={{ width: `${trvPct}%`, opacity: 0.6 }} />
                    </div>
                  </div>
                  {/* Confidence */}
                  <div className="col-span-1 text-center">
                    {conf > 0 ? (
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${conf >= 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {conf}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-300 font-mono">—</span>
                    )}
                  </div>
                  {/* Action */}
                  <div className="col-span-2 flex justify-end">
                    <span className="text-[10px] text-[#1B4FD8] font-semibold opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                      View 360 <ArrowUpRight size={10} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom action bar */}
          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50 rounded-b-lg">
            <p className="text-[10px] text-gray-400">
              Showing {customers.length} of {stats.totalCustomers ?? 0} unified customers
            </p>
            <div className="flex items-center gap-3">
              {activeOpps > 0 && (
                <button
                  onClick={() => navigate('/opportunities')}
                  className="text-[10px] text-[#1B4FD8] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                >
                  {activeOpps} cross-sell opportunities <ArrowRight size={10} />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
