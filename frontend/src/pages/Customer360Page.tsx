import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, AlertTriangle, CheckCircle, Minus,
  ChevronDown, ChevronUp, ExternalLink, Info,
} from 'lucide-react';
import { useState } from 'react';
import { customerApi } from '../api/customerApi';
import { ConfidenceBadge } from '../components/shared/ConfidenceBadge';
import { SourceBadge } from '../components/shared/SourceBadge';
import { ErrorState } from '../components/shared/ErrorState';
import { formatINR, formatDate, formatProduct, opportunityPriority } from '../utils/format';
import type {
  FieldEvidence, AttributeConflict, Opportunity,
  SourceLineageItem, ProductSummary,
} from '../types';
import clsx from 'clsx';

function maskSensitive(field: string, value: string | null | undefined): string {
  if (!value) return 'Not available';
  if (field === 'pan' || field === 'PAN') {
    return value.includes('*') ? value : (value.length > 4 ? value.substring(0, 4) + '****' : value);
  }
  if (field === 'mobile' || field === 'Mobile') {
    return value.includes('*') ? value : (value.length > 5 ? value.substring(0, 5) + '*****' : value);
  }
  return value;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EvidencePill({ result, similarity }: Pick<FieldEvidence, 'result' | 'similarity'>) {
  if (result === 'MATCH')    return <span className="evidence-match">Match</span>;
  if (result === 'CONFLICT') return <span className="evidence-conflict">Conflict</span>;
  if (result === 'PARTIAL')  return <span className="evidence-partial">Partial {similarity != null ? `(${Math.round(similarity * 100)}%)` : ''}</span>;
  return <span className="evidence-missing">Missing — not scored</span>;
}

const PRODUCTS = ['EQUITY', 'MF', 'INSURANCE', 'LOANS', 'WEALTH'];
const PRODUCT_BORDER: Record<string, string> = {
  EQUITY: 'border-l-navy-700', MF: 'border-l-teal-600',
  INSURANCE: 'border-l-amber-500', LOANS: 'border-l-red-500', WEALTH: 'border-l-slate-400',
};

function ProductCard({ p }: { p: ProductSummary }) {
  return (
    <div className={clsx(
      'card p-3 border-l-2',
      p.exists ? (PRODUCT_BORDER[p.product] ?? 'border-l-slate-300') : 'border-l-slate-200 opacity-50'
    )}>
      <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {formatProduct(p.product)}
      </p>
      {p.exists ? (
        <>
          <p className="text-base font-semibold text-slate-900">{formatINR(p.relationshipValue)}</p>
          <span className={clsx(
            'badge mt-1',
            p.status?.toLowerCase() === 'active' ? 'badge-green' :
            p.status?.toLowerCase() === 'lapsed' ? 'badge-red' : 'badge-slate'
          )}>
            {p.status ?? 'Active'}
          </span>
        </>
      ) : (
        <p className="text-sm text-slate-400 mt-1">Not held</p>
      )}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full mb-3 group"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <h3 className="section-title group-hover:text-slate-700 transition-colors">{title}</h3>
          {count != null && <span className="badge badge-slate">{count}</span>}
        </div>
        {open ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
      </button>
      {open && children}
    </div>
  );
}

// ─── Identity Evidence ────────────────────────────────────────────────────────
function EvidenceSection({ evidence, confidence }: { evidence: FieldEvidence[]; confidence: number }) {
  if (!evidence.length) return null;
  const FIELD_LABELS: Record<string, string> = {
    pan: 'PAN', mobile: 'Mobile', email: 'Email',
    dob: 'Date of Birth', name: 'Name', city: 'City',
  };
  return (
    <Section title="Identity Evidence — Why These Records Were Linked">
      <div className="card overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            <Info size={12} className="text-teal-600" />
            Field-level comparison showing why these source records were unified into one golden customer.
          </p>
          <ConfidenceBadge score={confidence} showBar />
        </div>
        <table className="table-base">
          <thead>
            <tr>
              <th>Field</th>
              <th>Weight</th>
              <th>Value (Source A)</th>
              <th>Value (Source B)</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {evidence.map((e, i) => (
              <tr key={i} className={e.result === 'CONFLICT' ? 'bg-red-50' : e.result === 'MATCH' ? 'bg-green-50/30' : ''}>
                <td className="font-medium text-slate-800">{FIELD_LABELS[e.field] ?? e.field}</td>
                <td className="text-slate-500 text-xs">{e.weight}</td>
                <td className="font-mono text-xs text-slate-700">
                  {e.valueA != null
                    ? maskSensitive(e.field, e.valueA)
                    : <span className="text-slate-300 not-italic">Not available</span>}
                </td>
                <td className="font-mono text-xs text-slate-700">
                  {e.valueB != null
                    ? maskSensitive(e.field, e.valueB)
                    : <span className="text-slate-300 not-italic">Not available</span>}
                </td>
                <td><EvidencePill result={e.result} similarity={e.similarity} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
          <p className="text-2xs text-slate-400">
            Confidence = weighted score over non-missing fields only.
            Missing fields are excluded from both numerator and denominator — they do not penalise the score.
          </p>
        </div>
      </div>
    </Section>
  );
}

// ─── Attribute Conflicts ──────────────────────────────────────────────────────
function ConflictsSection({ conflicts }: { conflicts: AttributeConflict[] }) {
  if (!conflicts.length) return null;
  return (
    <Section title="Attribute Conflicts" count={conflicts.length}>
      <div className="card overflow-hidden">
        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100">
          <p className="text-xs text-amber-700 flex items-center gap-1.5">
            <AlertTriangle size={11} />
            Source systems disagree on {conflicts.length} attribute{conflicts.length > 1 ? 's' : ''}.
            Conflicts are preserved for traceability — this is expected behaviour, not an error.
            Winner selected by source precedence: EQUITY → WEALTH → MF → INSURANCE → LOANS.
          </p>
        </div>
        {conflicts.map((c) => (
          <div key={c.field} className="px-4 py-3 grid grid-cols-3 gap-4 text-sm border-b border-slate-100 last:border-0">
            <div>
              <p className="text-2xs text-slate-400 uppercase tracking-wider mb-1">Field</p>
              <p className="font-semibold text-slate-800 capitalize">{c.field}</p>
            </div>
            <div>
              <p className="text-2xs text-slate-400 uppercase tracking-wider mb-1">
                Selected value
              </p>
              <p className="font-medium text-slate-800">{c.selectedValue ?? '—'}</p>
              <span className="badge badge-teal mt-1">{c.selectedSource}</span>
            </div>
            <div>
              <p className="text-2xs text-slate-400 uppercase tracking-wider mb-1">Conflicting values</p>
              {c.conflictingValues.map((v, i) => (
                <div key={i} className="flex items-center gap-1.5 mb-1">
                  <span className="badge badge-amber">{v.source}</span>
                  <span className="text-xs text-slate-600 font-mono">{v.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Source Lineage ───────────────────────────────────────────────────────────
function LineageSection({ lineage }: { lineage: SourceLineageItem[] }) {
  if (!lineage.length) return null;
  return (
    <Section title={`Source Lineage — ${lineage.length} System${lineage.length > 1 ? 's' : ''} Linked`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {lineage.map((item) => (
          <div key={`${item.sourceSystem}-${item.sourceCustomerId}`} className="card p-3">
            <div className="flex items-center gap-2 mb-2.5">
              <SourceBadge system={item.sourceSystem} size="sm" />
              <span className="font-mono text-xs text-slate-600 font-medium">{item.sourceCustomerId}</span>
            </div>
            {item.normalized && (
              <div className="space-y-1 text-xs">
                {[
                  ['Name',   item.normalized.name],
                  ['Mobile', maskSensitive('mobile', item.normalized.mobile)],
                  ['Email',  item.normalized.email],
                  ['PAN',    maskSensitive('pan', item.normalized.pan)],
                  ['DOB',    item.normalized.dob],
                  ['City',   item.normalized.city],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex gap-1.5">
                    <span className="text-slate-400 w-12 shrink-0">{label}</span>
                    <span className="font-mono text-slate-700 truncate">
                      {val || <span className="text-slate-300 italic">Not available</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-2xs text-slate-400 mt-2">
        Original source records are never deleted. These records are linked to this Golden Customer — not overwritten.
      </p>
    </Section>
  );
}

// ─── Opportunities ────────────────────────────────────────────────────────────
const PRIORITY_BADGE: Record<string, string> = {
  High: 'badge-red', Medium: 'badge-amber', Low: 'badge-slate',
};

function OpportunitiesSection({ opportunities, onViewAll }: {
  opportunities: Opportunity[];
  onViewAll: () => void;
}) {
  const active = opportunities.filter((o) => o.status !== 'dismissed');
  if (!active.length) return (
    <div>
      <h3 className="section-title mb-2">Next Best Opportunities</h3>
      <p className="text-xs text-slate-400">No active opportunities for this customer.</p>
    </div>
  );
  return (
    <Section title="Next Best Opportunities" count={active.length}>
      <div className="space-y-2">
        {active.map((opp) => {
          const priority = opportunityPriority(opp.score);
          return (
            <div key={opp.id} className="card p-3">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className={clsx('badge', PRIORITY_BADGE[priority])}>{priority}</span>
                  <span className="font-semibold text-slate-800">{formatProduct(opp.product)}</span>
                  <span className="badge badge-slate capitalize">{opp.status}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-2xs text-slate-400">Score</p>
                    <p className="font-semibold text-slate-800">{opp.score}/100</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xs text-slate-400">Potential Value</p>
                    <p className="font-semibold text-teal-700">{formatINR(opp.potentialValue)}</p>
                  </div>
                </div>
              </div>

              {opp.reasons && opp.reasons.length > 0 && (
                <div className="space-y-1 mb-2 pl-1">
                  <p className="text-2xs text-slate-500 font-medium uppercase tracking-wider">Why this opportunity was generated</p>
                  {opp.reasons.map((r, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      {r.met
                        ? <CheckCircle size={11} className="text-green-600 shrink-0" />
                        : <Minus size={11} className="text-slate-300 shrink-0" />}
                      <span className={r.met ? 'text-slate-700' : 'text-slate-400'}>{r.label}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-medium text-slate-600">{r.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-2xs text-slate-400">
                Rule-based intelligence — not AI generated. Driven by configurable eligibility conditions.
              </p>
            </div>
          );
        })}
        <button onClick={onViewAll} className="btn-ghost text-xs">
          <ExternalLink size={11} /> View all opportunities
        </button>
      </div>
    </Section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function Customer360Page() {
  const { goldenId } = useParams<{ goldenId: string }>();
  const navigate = useNavigate();

  const { data: c, isLoading, error, refetch } = useQuery({
    queryKey: ['customer360', goldenId],
    queryFn: () => customerApi.getById(goldenId!),
    enabled: !!goldenId,
  });

  if (isLoading) {
    return (
      <div className="p-5 space-y-4 animate-pulse max-w-5xl">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-24 w-full rounded" />
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded" />)}
        </div>
        <div className="skeleton h-40 w-full rounded" />
      </div>
    );
  }

  if (error) return (
    <div className="p-5">
      <button onClick={() => navigate(-1)} className="btn-ghost text-xs mb-4">
        <ArrowLeft size={13} /> Back
      </button>
      <ErrorState error={error} onRetry={() => refetch()} />
    </div>
  );

  const hasConflicts = (c!.attributeConflicts ?? []).length > 0;
  const hasEvidence  = (c!.evidenceTable ?? []).length > 0;
  const hasLineage   = (c!.sourceLineage ?? []).length > 0;

  return (
    <div className="p-5 max-w-5xl space-y-7">

      {/* Back */}
      <button onClick={() => navigate('/customers')} className="btn-ghost text-xs -ml-1">
        <ArrowLeft size={13} /> All Customers
      </button>

      {/* ── HEADER CARD ── */}
      <div className="card p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold text-slate-900">{c!.name}</h1>
              {hasConflicts && (
                <span className="badge badge-amber flex items-center gap-1">
                  <AlertTriangle size={10} />
                  {c!.attributeConflicts.length} attribute conflict{c!.attributeConflicts.length > 1 ? 's' : ''}
                </span>
              )}
              <span className="badge badge-teal">
                {(c!.linkedSources ?? []).length} source system{(c!.linkedSources ?? []).length > 1 ? 's' : ''} unified
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>Golden ID: <span className="font-mono font-semibold text-slate-700">{c!.goldenId}</span></span>
              {c!.city && <span>City: <span className="capitalize text-slate-700">{c!.city}</span></span>}
              {c!.segment && <span>Segment: <span className="text-slate-700">{c!.segment}</span></span>}
              {c!.dob && <span>DOB: <span className="text-slate-700">{formatDate(c!.dob)}</span></span>}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-xs text-slate-400">Total Relationship Value</p>
              <p className="text-2xl font-semibold text-teal-700">{formatINR(c!.totalRelationshipValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Match Confidence</p>
              {c!.matchConfidence > 0
                ? <ConfidenceBadge score={c!.matchConfidence} showBar />
                : <span className="text-xs text-slate-400 mt-1 block">Single source record</span>}
            </div>
          </div>
        </div>

        {/* Identity fields row */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {[
            { label: 'PAN', value: c!.pan },
            { label: 'Mobile', value: c!.mobile },
            { label: 'Email', value: c!.email },
            { label: 'Source Systems', isComponents: true },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-slate-400 mb-0.5">{f.label}</p>
              {f.isComponents ? (
                <div className="flex flex-wrap gap-1">
                  {(c!.linkedSources ?? []).map((s) => <SourceBadge key={s} system={s} />)}
                </div>
              ) : (
                <p className="font-mono text-slate-700">
                  {f.value ?? <span className="text-slate-300 italic">Not available</span>}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── PRODUCT HOLDINGS ── */}
      <div>
        <h2 className="section-title mb-3">Product Holdings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {PRODUCTS.map((prod) => {
            const p = c!.products?.find((x) => x.product === prod)
              ?? { product: prod, exists: false, relationshipValue: null, status: null };
            return <ProductCard key={prod} p={p} />;
          })}
        </div>
        <p className="text-2xs text-slate-400 mt-2">
          Products not held by this customer are highlighted as cross-sell opportunities in the opportunity engine.
        </p>
      </div>

      {/* ── OPPORTUNITIES ── */}
      <OpportunitiesSection
        opportunities={c!.opportunities ?? []}
        onViewAll={() => navigate('/opportunities')}
      />

      {/* ── EVIDENCE ── */}
      {hasEvidence && (
        <EvidenceSection evidence={c!.evidenceTable} confidence={c!.matchConfidence} />
      )}

      {/* ── CONFLICTS ── */}
      {hasConflicts && <ConflictsSection conflicts={c!.attributeConflicts} />}

      {/* ── LINEAGE ── */}
      {hasLineage && <LineageSection lineage={c!.sourceLineage} />}
    </div>
  );
}
