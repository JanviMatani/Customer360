import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, RefreshCw, Database, GitMerge, Zap,
  Users, TrendingUp, CheckCircle, AlertTriangle, Play,
} from 'lucide-react';
import { dashboardApi } from '../api/dashboardApi';
import { adminApi } from '../api/adminApi';
import { useAuthStore } from '../auth/authStore';
import { toastStore } from '../utils/toast';
import clsx from 'clsx';

// ─── Pipeline Stage Card ──────────────────────────────────────────────────────

interface StageProps {
  number: number;
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  items: string[];
  stat?: string;
  statLabel?: string;
  isLast?: boolean;
}

function PipelineStage({
  number, title, icon: Icon, color, bgColor, borderColor,
  items, stat, statLabel, isLast,
}: StageProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-col items-center">
        <div className={clsx('card p-3 border-l-2 w-44 shrink-0', borderColor)}>
          <div className={clsx('flex items-center gap-2 mb-2')}>
            <div className={clsx('w-6 h-6 rounded flex items-center justify-center', bgColor)}>
              <Icon size={13} className={color} />
            </div>
            <div>
              <p className="text-2xs text-slate-400 font-medium">Stage {number}</p>
              <p className="text-xs font-semibold text-slate-800">{title}</p>
            </div>
          </div>
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-2xs text-slate-500">
                <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          {stat != null && (
            <div className={clsx('mt-2 pt-2 border-t border-slate-100')}>
              <p className={clsx('text-base font-semibold', color)}>{stat}</p>
              {statLabel && <p className="text-2xs text-slate-400">{statLabel}</p>}
            </div>
          )}
        </div>
      </div>
      {!isLast && (
        <div className="flex items-center self-center mt-2 shrink-0">
          <ArrowRight size={16} className="text-slate-300" />
        </div>
      )}
    </div>
  );
}

// ─── Demo Scenario Card ───────────────────────────────────────────────────────

interface ScenarioProps {
  number: number;
  title: string;
  description: string;
  linkLabel: string;
  linkTo: string;
  icon: React.ElementType;
  variant: 'green' | 'amber' | 'red' | 'teal' | 'slate';
}

const VARIANT_CLASSES: Record<string, { badge: string; icon: string; border: string }> = {
  green: { badge: 'badge-green', icon: 'text-green-600', border: 'border-l-green-500' },
  amber: { badge: 'badge-amber', icon: 'text-amber-600', border: 'border-l-amber-500' },
  red:   { badge: 'badge-red',   icon: 'text-red-600',   border: 'border-l-red-500'   },
  teal:  { badge: 'badge-teal',  icon: 'text-teal-600',  border: 'border-l-teal-500'  },
  slate: { badge: 'badge-slate', icon: 'text-slate-500', border: 'border-l-slate-400' },
};

function ScenarioCard({ number, title, description, linkLabel, linkTo, icon: Icon, variant }: ScenarioProps) {
  const navigate = useNavigate();
  const vc = VARIANT_CLASSES[variant];
  return (
    <div className={clsx('card p-4 border-l-2', vc.border)}>
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={13} className={vc.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx('badge', vc.badge)}>Scenario {number}</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 mb-1">{title}</p>
          <p className="text-xs text-slate-500 mb-3">{description}</p>
          <button
            onClick={() => navigate(linkTo)}
            className="btn-ghost text-xs py-1"
          >
            {linkLabel} <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PipelinePage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isAdmin = user?.role === 'admin';

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  const reloadMutation = useMutation({
    mutationFn: adminApi.reloadAndRematch,
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['opportunities'] });
      toastStore.success(`Pipeline complete — ${result.evaluatedPairs} pairs evaluated.`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toastStore.error(msg ?? 'Pipeline run failed. Please try again.');
    },
  });

  const recomputeMutation = useMutation({
    mutationFn: adminApi.recomputeOpportunities,
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['opportunities'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toastStore.success(`Opportunities recomputed — ${result.generatedOpportunities} generated.`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toastStore.error(msg ?? 'Failed to recompute opportunities.');
    },
  });

  const rawRows = stats?.ingestedRawRows ?? 0;
  const totalCustomers = stats?.totalCustomers ?? 0;
  const pendingReview = stats?.pendingReviewCount ?? 0;
  const autoMerged = stats?.autoMergedCount ?? 0;

  const stages: StageProps[] = [
    {
      number: 1,
      title: 'Raw Data',
      icon: Database,
      color: 'text-navy-700',
      bgColor: 'bg-navy-50',
      borderColor: 'border-l-navy-700',
      items: ['Equity', 'Mutual Funds', 'Insurance', 'Loans', 'Wealth'],
      stat: rawRows > 0 ? rawRows.toLocaleString('en-IN') : '—',
      statLabel: 'source records',
    },
    {
      number: 2,
      title: 'Normalization',
      icon: RefreshCw,
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-l-teal-500',
      items: ['Mobile formatting', 'PAN cleanup', 'Name cleanup', 'DOB parsing'],
    },
    {
      number: 3,
      title: 'Candidate Gen',
      icon: GitMerge,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-l-amber-500',
      items: ['PAN blocking', 'Mobile blocking', 'Email blocking', 'Name+DOB blocking'],
    },
    {
      number: 4,
      title: 'Confidence Scoring',
      icon: Zap,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-l-purple-500',
      items: ['Weighted match', 'Fuzzy name match', 'Conflict detection', 'Score threshold'],
    },
    {
      number: 5,
      title: 'Golden Customers',
      icon: Users,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-l-green-500',
      items: [
        `Auto-merged: ${autoMerged > 0 ? autoMerged.toLocaleString('en-IN') : '—'}`,
        `Pending review: ${pendingReview > 0 ? pendingReview.toLocaleString('en-IN') : '0'}`,
        'Separated records',
      ],
      stat: totalCustomers > 0 ? totalCustomers.toLocaleString('en-IN') : '—',
      statLabel: 'golden records',
      isLast: true,
    },
  ];

  const scenarios: ScenarioProps[] = [
    {
      number: 1,
      title: 'PAN match across 3 systems',
      description: 'Same customer exists in Equity, MF, and Insurance. PAN matches exactly, email differs. Auto-merged with high confidence.',
      linkLabel: 'View customer CUST0001',
      linkTo: '/customers/CUST0001',
      icon: CheckCircle,
      variant: 'green',
    },
    {
      number: 2,
      title: 'Probabilistic match — no PAN',
      description: 'PAN missing in one system. Mobile + name similarity triggers probabilistic match. Confidence ~70–84%.',
      linkLabel: 'Browse customers',
      linkTo: '/customers',
      icon: GitMerge,
      variant: 'teal',
    },
    {
      number: 3,
      title: 'Shared mobile, PAN conflict → review',
      description: 'Two records share a mobile number but have different PANs. Hard-conflict rule routes the pair to manual review.',
      linkLabel: 'Open review queue',
      linkTo: '/review',
      icon: AlertTriangle,
      variant: 'red',
    },
    {
      number: 4,
      title: 'Cross-sell: Equity+MF, no Insurance',
      description: 'Customer holds Equity and MF products. Insurance product is missing — generating a cross-sell opportunity.',
      linkLabel: 'View opportunities',
      linkTo: '/opportunities',
      icon: TrendingUp,
      variant: 'amber',
    },
    {
      number: 5,
      title: 'Threshold tuning → see impact',
      description: 'Adjust auto-merge and manual review thresholds in Configuration. Re-run the pipeline to see how the distribution changes.',
      linkLabel: 'Go to Configuration',
      linkTo: '/configuration',
      icon: Zap,
      variant: 'slate',
    },
  ];

  return (
    <div className="p-5 max-w-6xl">

      {/* Header */}
      <div className="page-header flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Identity Resolution Pipeline</h1>
          <p className="page-subtitle">
            Live visualization of the full customer deduplication and unification flow
          </p>
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => recomputeMutation.mutate()}
              disabled={recomputeMutation.isPending || reloadMutation.isPending}
              className="btn-secondary text-xs"
            >
              {recomputeMutation.isPending ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  Recomputing…
                </>
              ) : (
                <>
                  <TrendingUp size={12} />
                  Recompute Opportunities
                </>
              )}
            </button>
            <button
              onClick={() => reloadMutation.mutate()}
              disabled={reloadMutation.isPending || recomputeMutation.isPending}
              className="btn-primary text-xs"
            >
              {reloadMutation.isPending ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  Pipeline running…
                </>
              ) : (
                <>
                  <Play size={12} />
                  Run Pipeline
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Pipeline diagram */}
      <div className="mb-8">
        <h2 className="section-title mb-4">Pipeline Stages</h2>
        <div className="overflow-x-auto pb-2">
          <div className="flex items-start gap-2 min-w-max">
            {stages.map((stage) => (
              <PipelineStage key={stage.number} {...stage} />
            ))}
          </div>
        </div>
      </div>

      {/* Stats summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="card p-3 border-l-2 border-l-navy-700">
          <p className="text-2xs text-slate-400">Source Records</p>
          <p className="text-xl font-semibold text-slate-900">
            {rawRows > 0 ? rawRows.toLocaleString('en-IN') : '—'}
          </p>
          <p className="text-2xs text-slate-400">ingested</p>
        </div>
        <div className="card p-3 border-l-2 border-l-green-500">
          <p className="text-2xs text-slate-400">Golden Customers</p>
          <p className="text-xl font-semibold text-green-700">
            {totalCustomers > 0 ? totalCustomers.toLocaleString('en-IN') : '—'}
          </p>
          <p className="text-2xs text-slate-400">unified records</p>
        </div>
        <div className="card p-3 border-l-2 border-l-amber-500">
          <p className="text-2xs text-slate-400">Pending Review</p>
          <p className={clsx('text-xl font-semibold', pendingReview > 0 ? 'text-amber-700' : 'text-slate-400')}>
            {pendingReview}
          </p>
          <p className="text-2xs text-slate-400">require human decision</p>
        </div>
        <div className="card p-3 border-l-2 border-l-teal-500">
          <p className="text-2xs text-slate-400">Auto-Merged</p>
          <p className="text-xl font-semibold text-teal-700">
            {autoMerged > 0 ? autoMerged.toLocaleString('en-IN') : '—'}
          </p>
          <p className="text-2xs text-slate-400">high-confidence merges</p>
        </div>
      </div>

      {/* Demo scenarios */}
      <div>
        <div className="mb-4">
          <h2 className="section-title">Demo Scenarios</h2>
          <p className="text-xs text-slate-500 mt-1">
            Five key scenarios that illustrate the platform's identity resolution capabilities
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {scenarios.map((s) => (
            <ScenarioCard key={s.number} {...s} />
          ))}
        </div>
      </div>
    </div>
  );
}
