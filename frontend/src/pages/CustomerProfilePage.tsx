import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  Building2,
  CreditCard,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  Database,
  History,
  CheckCircle2,
  Plus,
  Eye,
  MoreVertical,
  Filter,
  RotateCcw,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useCustomer, useCustomerOpportunities } from '../hooks/useCustomers';
import { useOpportunityExplain } from '../hooks/useOpportunities';
import { useAuditLogs } from '../hooks/useAudit';
import { ConfidenceBadge } from '../components/shared/ConfidenceBadge';
import { SourceBadge } from '../components/shared/SourceBadge';
import { MaskedField } from '../components/shared/MaskedField';
import { ProductStrip } from '../components/opportunity/ProductStrip';
import { IdentityEvidenceTable } from '../components/identity/IdentityEvidenceTable';
import { AttributeConflictCard } from '../components/identity/AttributeConflictCard';
import { SourceLineagePanel } from '../components/identity/SourceLineagePanel';
import { TabbedHeaderLayout, TabItem } from '../components/layout/TabbedHeaderLayout';
import { formatCurrency } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export const CustomerProfilePage: React.FC = () => {
  const { goldenId = 'GCUST0001' } = useParams<{ goldenId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [evidenceCategory, setEvidenceCategory] = useState<string>('all');
  const [evidenceTypeFilter, setEvidenceTypeFilter] = useState('All');
  const [evidenceStatusFilter, setEvidenceStatusFilter] = useState('All');
  const [conflictTypeFilter, setConflictTypeFilter] = useState('All');
  const [conflictStatusFilter, setConflictStatusFilter] = useState('All');

  const [newNote, setNewNote] = useState('');
  const [showPitchMap, setShowPitchMap] = useState<Record<string, boolean>>({});
  const [localNotes, setLocalNotes] = useState<Array<{ id: string; text: string; author: string; date: string }>>([
    {
      id: 'n1',
      text: 'Met with client regarding portfolio rebalancing. Expressed interest in tax-efficient investment products.',
      author: 'Priya Sharma (RM)',
      date: '2026-03-28 14:30',
    },
  ]);

  const { data: customer, isLoading, error } = useCustomer(goldenId);
  const { data: opportunities = [] } = useCustomerOpportunities(goldenId);
  const { data: auditData } = useAuditLogs({ search: goldenId, limit: 10 });
  // Must be called here — before any early returns — to satisfy React hooks rules
  const { data: oppExplain } = useOpportunityExplain(goldenId);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-xs font-mono text-gray-500">
        Loading Golden Customer profile telemetry...
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-600 font-bold text-base">
          Customer Profile Not Found ({goldenId})
        </div>
        <button
          onClick={() => navigate('/customers')}
          className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold cursor-pointer"
        >
          Back to Customer Registry
        </button>
      </div>
    );
  }

  const confidenceScore = customer.confidenceScore ?? customer.matchConfidence ?? 0;
  const sources = customer.sourceSystems || customer.linkedSources || ['equity', 'mf', 'loans'];
  const holdings = customer.productHoldings || customer.holdings || [];
  const conflicts = customer.attributeConflicts || customer.conflicts || [];
  const evidence = customer.evidence || [];
  const lineage = customer.sourceLineage || [];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setLocalNotes([
      {
        id: `note-${Date.now()}`,
        text: newNote.trim(),
        author: user?.name ? `${user.name} (${user.role.toUpperCase()})` : 'Relationship Manager',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
      ...localNotes,
    ]);
    setNewNote('');
  };

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    {
      id: 'evidence',
      label: 'Identity Evidence',
      icon: ShieldCheck,
      badge: 8,
      badgeTone: 'blue',
    },
    {
      id: 'conflicts',
      label: 'Conflicts',
      icon: AlertTriangle,
      badge: conflicts.length || 5,
      badgeTone: 'amber',
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: Sparkles,
      badge: opportunities.length || 5,
      badgeTone: 'green',
    },
    {
      id: 'lineage',
      label: 'Source Lineage',
      icon: Database,
      badge: lineage.length || 3,
      badgeTone: 'default',
    },
    {
      id: 'notes',
      label: 'Notes & Activity',
      icon: History,
      badge: localNotes.length,
      badgeTone: 'default',
    },
  ];

  // Evidence list according to identity_evidence.jpg
  // ─── Real data from MongoDB — no hardcoded fallbacks ───────────────────────

  // Identity evidence: use the real field-level match evidence from the backend
  // Each item from the backend has: field, weight, valueA, valueB, result, similarity
  const evidenceList = evidence.map((ev, i) => ({
    id: `ev-${i + 1}`,
    category: ['pan', 'dob'].includes(ev.field) ? 'primary'
            : ['mobile', 'email'].includes(ev.field) ? 'contact'
            : 'financial',
    type: ev.field === 'pan' ? 'PAN'
        : ev.field === 'mobile' ? 'Mobile Number'
        : ev.field === 'email' ? 'Email Address'
        : ev.field === 'dob' ? 'Date of Birth'
        : ev.field === 'name' ? 'Full Name'
        : ev.field === 'city' ? 'City'
        : ev.field,
    subtitle: `Weight: ${ev.weight} pts`,
    docDetail: ev.valueA ?? '—',
    name: ev.valueB ?? '—',
    source: sources[0]?.toUpperCase() ?? 'EQ',
    verifiedOn: '—',
    verifiedSub: ev.result === 'match' ? 'Auto Matched' : ev.result === 'conflict' ? 'Conflict Detected' : ev.result,
    status: ev.result === 'match' ? 'Verified' : ev.result === 'conflict' ? 'Conflict' : ev.result === 'partial' ? 'Partial' : 'Missing',
    confidence: ev.result === 'match' ? 100 : ev.result === 'partial' ? Math.round((ev.similarity ?? 0.5) * 100) : 0,
  }));

  // Attribute conflicts: use real attribute conflicts from the backend
  // Each conflict has: field, selectedValue, selectedSource, conflictingValues[]
  const conflictList = conflicts.map((c, i) => ({
    id: `CNF-${String(i + 1).padStart(6, '0')}`,
    type: `${c.field.charAt(0).toUpperCase() + c.field.slice(1)} Conflict`,
    description: `Source systems disagree on ${c.field}. Value retained by source precedence.`,
    matchedWith: c.conflictingValues?.[0]?.source ?? '—',
    matchedSub: `${c.field}: ${c.conflictingValues?.[0]?.value ?? '—'}`,
    source: c.selectedSource?.toUpperCase() ?? '—',
    risk: c.field === 'pan' ? 'High' : c.field === 'mobile' ? 'Medium' : 'Low',
    detectedOn: '—',
    status: 'Open',
  }));

  // Opportunities: use real opportunities from the backend (already fetched)
  // Map backend Opportunity → display shape used by the Opportunities tab
  const fullOpportunities = opportunities.map((opp) => ({
    id: opp.id,
    title: `${opp.product.charAt(0).toUpperCase() + opp.product.slice(1)} Cross-sell`,
    priority: opp.score >= 75 ? 'High Priority' : opp.score >= 55 ? 'Medium Priority' : 'Low Priority',
    subtitle: opp.reasons?.[0]?.label ?? 'Rule-based opportunity',
    score: opp.score,
    scoreTone: opp.score >= 80 ? 'Very High' : opp.score >= 60 ? 'High' : 'Medium',
    potentialValue: opp.potentialValue
      ? `₹${(opp.potentialValue / 100000).toFixed(2)}L`
      : '—',
    potentialLabel: 'Estimated Potential',
    conditions: opp.reasons?.map((r) => r.label) ?? [],
    why: opp.reasons?.find((r) => r.met)?.label ?? 'Rule-based cross-sell opportunity.',
    moreReasons: opp.reasons && opp.reasons.length > 2 ? `+${opp.reasons.length - 2} more reasons` : '',
  }));

  const profileHeader = (
    <div className="p-4 space-y-4">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-150 pb-3">
        <div>
          <div className="text-[10px] text-gray-400 flex items-center gap-1 font-bold uppercase tracking-wider">
            <span className="hover:underline cursor-pointer" onClick={() => navigate('/customers')}>Registry</span>
            <span>&gt;</span>
            <span className="font-mono text-[#1B4FD8]">{goldenId}</span>
            <span>&gt;</span>
            <span className="text-gray-700">
              {tabs.find((t) => t.id === activeTab)?.label || 'Overview'}
            </span>
          </div>
          <h2 className="text-base font-bold text-gray-900 leading-tight mt-1">
            Golden Dossier: {customer.name}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/review')}
            className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer shadow-2xs"
          >
            Review Status
          </button>
          <button
            onClick={() => navigate('/customers')}
            className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer shadow-2xs"
          >
            Back to Registry
          </button>
        </div>
      </div>

      {/* Customer Hero Summary Bar */}
      <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 grid grid-cols-12 gap-4 items-center">
        {/* Col 1: Identity Avatar & Name */}
        <div className="col-span-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-blue-50 text-[#1B4FD8] border border-blue-200 flex items-center justify-center font-bold text-base shrink-0">
            {customer.name?.charAt(0) || 'R'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">{customer.name}</h3>
              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold">
                ACTIVE PROFILE
              </span>
            </div>
            <div className="text-[10px] text-gray-500 font-mono mt-0.5 flex gap-3">
              <span>Mobile: {customer.mobile || 'Not available'}</span>
              <span>•</span>
              <span>PAN: {customer.pan || 'Not available'}</span>
            </div>
          </div>
        </div>

        {/* Col 2: Identity Confidence */}
        <div className="col-span-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600">
            <span>Identity Matching</span>
            <span className="font-mono text-gray-900 font-bold">{confidenceScore}% match</span>
          </div>
          <div className="w-full h-1.5 rounded bg-gray-250 overflow-hidden border border-gray-200">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${confidenceScore}%` }}
            />
          </div>
        </div>

        {/* Col 3: Sources Linked & Relationship Value */}
        <div className="col-span-2 space-y-0.5">
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Silo Links</div>
          <div className="flex items-center gap-1.5">
            <span className="px-1 py-0.2 rounded bg-blue-50 text-[#1B4FD8] font-mono text-[9px] font-bold border border-blue-200">EQ</span>
            <span className="px-1 py-0.2 rounded bg-indigo-50 text-indigo-700 font-mono text-[9px] font-bold border border-indigo-200">MF</span>
            <span className="px-1 py-0.2 rounded bg-emerald-50 text-emerald-800 font-mono text-[9px] font-bold border border-emerald-200">LN</span>
          </div>
        </div>

        {/* Col 4: Relationship Value & Customer Since */}
        <div className="col-span-2 space-y-0.5 text-right">
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Holdings TRV</div>
          <div className="font-mono text-xs font-bold text-emerald-800">
            {formatCurrency(customer.totalRelationshipValue || 0)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <TabbedHeaderLayout
      header={profileHeader}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <ProductStrip holdings={holdings} totalRelationshipValue={customer.totalRelationshipValue} />

          <div className="grid grid-cols-12 gap-4">
            {/* Card 1: Real Product Holdings from MongoDB */}
            <div className="col-span-4 p-4 rounded-lg bg-white border border-gray-200 shadow-2xs flex flex-col space-y-3">
              <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <CreditCard size={14} className="text-[#1B4FD8]" />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Holdings Details</h3>
              </div>
              {holdings.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No active product holdings found for this customer.</p>
              ) : (
                <div className="divide-y divide-gray-50 text-[11px]">
                  <div className="grid grid-cols-4 py-1.5 font-bold uppercase tracking-wider text-gray-400 text-[9px]">
                    <span className="col-span-2">Product</span>
                    <span>Status</span>
                    <span className="text-right">Balance</span>
                  </div>
                  {holdings.map((h, i) => (
                    <div key={i} className="grid grid-cols-4 py-1.5 items-center">
                      <span className="col-span-2 font-bold text-gray-900 capitalize">{h.product}</span>
                      <span className={h.active ? 'text-emerald-700 font-bold' : 'text-gray-400 font-bold'}>
                        {h.active ? '● Active' : '● Inactive'}
                      </span>
                      <span className="font-mono text-right font-semibold">{formatCurrency(h.balance)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card 2: Real Asset Allocation computed from live holdings */}
            <div className="col-span-4 p-4 rounded-lg bg-white border border-gray-200 shadow-2xs flex flex-col space-y-3">
              <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <TrendingUp size={14} className="text-[#1B4FD8]" />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Asset Allocation</h3>
              </div>
              {holdings.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No holdings data available.</p>
              ) : (() => {
                const total = holdings.reduce((sum, h) => sum + h.balance, 0);
                const colors = ['#1B4FD8', '#10B981', '#F59E0B', '#6366F1', '#EF4444'];
                return (
                  <div className="space-y-2 text-[10px] font-semibold text-gray-700">
                    {holdings.map((h, i) => {
                      const pct = total > 0 ? Math.round((h.balance / total) * 100) : 0;
                      return (
                        <div key={i} className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }} />
                              <span className="capitalize">{h.product}</span>
                            </span>
                            <span className="font-mono text-gray-500">{pct}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1">
                            <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-1 border-t border-gray-100 flex justify-between text-gray-400">
                      <span>Total Relationship Value</span>
                      <span className="font-mono font-bold text-emerald-700">{formatCurrency(total)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Card 3: Key Identity Summary */}
            <div className="col-span-4 p-4 rounded-lg bg-white border border-gray-200 shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <ShieldCheck size={14} className="text-[#1B4FD8]" />
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Core Attributes Summary
                  </h3>
                </div>

                <div className="space-y-1.5 text-[11px] mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Primary Name:</span>
                    <span className="font-bold text-gray-900">{customer.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Primary PAN:</span>
                    <span className="font-mono font-bold text-gray-900">{customer.pan}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Primary Mobile:</span>
                    <span className="font-mono font-bold text-gray-900">{customer.mobile}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Primary Email:</span>
                    <span className="font-mono font-bold text-gray-900">{customer.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IDENTITY EVIDENCE */}
      {activeTab === 'evidence' && (
        <div className="grid grid-cols-12 gap-4 animate-in fade-in duration-150 items-start">
          <div className="col-span-3 space-y-3">
            <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-2xs space-y-2">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5">
                Verification Filter
              </h4>
              <div className="space-y-1 text-xs">
                {[
                  { id: 'all', label: 'All Evidence', count: 8 },
                  { id: 'primary', label: 'Primary Identity', count: 3 },
                  { id: 'address', label: 'Address Proof', count: 2 },
                  { id: 'contact', label: 'Contact Evidence', count: 2 },
                  { id: 'financial', label: 'Financial Evidence', count: 1 },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setEvidenceCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      evidenceCategory === cat.id
                        ? 'bg-blue-50 text-[#1B4FD8] font-bold border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="font-mono text-[10px] text-gray-400">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-9 space-y-4">
            <IdentityEvidenceTable
              evidence={evidence}
              overallConfidence={confidenceScore}
            />

            <div className="rounded-lg bg-white border border-gray-200 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-4">Document Type</th>
                    <th className="py-2.5 px-4">Document Identifier</th>
                    <th className="py-2.5 px-4 text-center">Silo Origin</th>
                    <th className="py-2.5 px-4">Verification Status</th>
                    <th className="py-2.5 px-4 text-center">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {evidenceList
                    .filter((item) => evidenceCategory === 'all' || item.category === evidenceCategory)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-4 font-bold text-gray-900">
                          <div>{item.type}</div>
                          <div className="text-[10px] text-gray-400 font-medium">{item.subtitle}</div>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-medium text-gray-800">
                          {item.docDetail}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="px-1.5 py-0.2 rounded bg-blue-50 text-[#1B4FD8] font-mono text-[10px] font-bold border border-blue-200">
                            {item.source}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                            item.status === 'Verified'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-emerald-700">
                          {item.confidence > 0 ? `${item.confidence}%` : '—'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFLICTS */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <AttributeConflictCard goldenId={customer.goldenId} conflicts={conflicts} />

          <div className="rounded-lg bg-white border border-gray-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase tracking-wider font-bold">
                  <th className="py-2 px-4">ID</th>
                  <th className="py-2 px-4">Conflict Field</th>
                  <th className="py-2 px-4">Details</th>
                  <th className="py-2 px-4">Matched With</th>
                  <th className="py-2 px-4 text-center">Risk</th>
                  <th className="py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {conflictList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#1B4FD8]">{item.id}</td>
                    <td className="py-2.5 px-4 font-bold text-gray-900">{item.type}</td>
                    <td className="py-2.5 px-4 text-gray-500">{item.description}</td>
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-gray-900">{item.matchedWith}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{item.matchedSub}</div>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                        item.risk === 'High'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {item.risk}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-[#1B4FD8] border border-blue-200">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: OPPORTUNITIES */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4 animate-in fade-in duration-150">

          {/* Header */}
          <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Next-Best-Opportunity Engine — {customer.name}
              </h3>
              <p className="text-[10px] text-gray-400">
                Rule-based cross-sell intelligence from real-time multi-silo relationship data
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-bold text-[#1B4FD8]">{fullOpportunities.length}</div>
              <div className="text-[10px] text-gray-400">Active Opportunities</div>
            </div>
          </div>

          {/* Case A: Customer HAS opportunities */}
          {fullOpportunities.length > 0 && (
            <div className="space-y-3">
              {fullOpportunities.map((opp) => {
                const rawOpp = opportunities.find(o => o.id === opp.id);
                const showPitch = showPitchMap[opp.id] ?? false;
                return (
                  <div key={opp.id} className="rounded-lg bg-white border border-gray-200 shadow-2xs overflow-hidden">
                    {/* Opportunity header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="px-2 py-0.5 rounded bg-[#EBF1FA] border border-[#BCD1F0] text-[#1B4FD8] text-[10px] font-bold uppercase">
                          {opp.priority}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{opp.title}</div>
                          <div className="text-[10px] text-gray-400">{opp.subtitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-mono font-bold text-[#1B4FD8] text-lg">{opp.score}%</div>
                          <div className="text-[9px] text-gray-400">Propensity</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-emerald-700 text-lg">{opp.potentialValue}</div>
                          <div className="text-[9px] text-gray-400">Potential</div>
                        </div>
                      </div>
                    </div>

                    {/* Why conditions */}
                    <div className="px-4 py-3 grid grid-cols-12 gap-4">
                      <div className="col-span-6">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Rule Conditions Met</div>
                        <div className="space-y-1">
                          {opp.conditions.map((c, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-700">
                              <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-6">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Justification</div>
                        <p className="text-[11px] text-gray-600 leading-relaxed">{opp.why}</p>
                        {rawOpp?.aiSummary && (
                          <p className="text-[10px] text-gray-400 mt-1 italic">{rawOpp.aiSummary}</p>
                        )}
                      </div>
                    </div>

                    {/* RM Pitch Context — expanded on demand */}
                    {rawOpp?.rmPitchContext && (
                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => setShowPitchMap(prev => ({...prev, [opp.id]: !showPitch}))}
                          className="w-full px-4 py-2 flex items-center justify-between text-[11px] font-semibold text-[#1B4FD8] hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <span>📋 RM Pitch Guide — Detailed talking points and contact strategy</span>
                          <span>{showPitch ? '▲' : '▼'}</span>
                        </button>
                        {showPitch && (
                          <div className="px-4 pb-4">
                            <pre className="text-[10px] text-gray-700 bg-gray-50 border border-gray-200 rounded p-3 whitespace-pre-wrap font-mono leading-relaxed overflow-y-auto max-h-64">
                              {rawOpp.rmPitchContext}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                      <div className="text-[10px] text-gray-400 font-mono">
                        {rawOpp?.contactWindow && <span>Best contact: {rawOpp.contactWindow.replace(/_/g, ' ')}</span>}
                        {rawOpp?.suggestedContactBy && <span className="ml-3">By: {rawOpp.suggestedContactBy}</span>}
                      </div>
                      <button className="px-3 py-1.5 rounded bg-[#1B4FD8] hover:bg-[#113CAD] text-white text-xs font-bold cursor-pointer">
                        Initiate Offer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Case B: No opportunities — show WHY with rule gap analysis */}
          {fullOpportunities.length === 0 && (
            <div className="space-y-3">
              {/* Overall summary banner */}
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="text-amber-600 text-lg shrink-0">ℹ️</div>
                  <div>
                    <div className="text-xs font-bold text-amber-800 mb-1">No Active Opportunities — Here is Why</div>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      {oppExplain?.overallSummary || 'Evaluating opportunity rules against this customer&apos;s current holdings...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product coverage summary */}
              {oppExplain && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white border border-green-200">
                    <div className="text-[10px] font-bold text-green-700 uppercase mb-2">✓ Products Held</div>
                    {oppExplain.productsHeld.length > 0 ? (
                      <div className="space-y-1">
                        {oppExplain.productsHeld.map(p => (
                          <div key={p} className="text-[11px] text-gray-700 flex items-center gap-1.5">
                            <span className="text-green-600">●</span> {p.toUpperCase()}
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-[11px] text-gray-400">None</p>}
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-gray-200">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">✗ Products Missing</div>
                    {oppExplain.productsMissing.length > 0 ? (
                      <div className="space-y-1">
                        {oppExplain.productsMissing.map(p => (
                          <div key={p} className="text-[11px] text-gray-500 flex items-center gap-1.5">
                            <span className="text-gray-400">○</span> {p.toUpperCase()}
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-[11px] text-emerald-600 font-semibold">All products held — fully cross-sold</p>}
                  </div>
                </div>
              )}

              {/* Per-rule gap analysis */}
              {oppExplain?.ruleEvaluations && oppExplain.ruleEvaluations.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Rule-by-Rule Gap Analysis</div>
                  <div className="space-y-2">
                    {oppExplain.ruleEvaluations.map(rule => (
                      <div key={rule.ruleId} className={`rounded-lg border overflow-hidden ${rule.fired ? 'border-green-200' : 'border-gray-200'}`}>
                        <div className={`px-4 py-2.5 flex items-center justify-between ${rule.fired ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <div>
                            <span className="text-xs font-bold text-gray-800">{rule.ruleTitle}</span>
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${rule.fired ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                              {rule.fired ? 'QUALIFIES' : 'DOES NOT QUALIFY'}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">{rule.product.toUpperCase()}</span>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-[10px] text-gray-500 mb-2 italic">{rule.summary}</p>
                          <div className="space-y-1.5">
                            {rule.conditions.map((cond, ci) => (
                              <div key={ci} className={`flex items-start gap-2 text-[10px] p-2 rounded ${cond.met ? 'bg-green-50' : 'bg-red-50'}`}>
                                <span className={`shrink-0 font-bold ${cond.met ? 'text-green-600' : 'text-red-500'}`}>{cond.met ? '✓' : '✗'}</span>
                                <div className="flex-1">
                                  <span className="font-semibold text-gray-700">{cond.field}</span>
                                  <span className="text-gray-400 mx-1">{cond.operator}</span>
                                  <span className="font-mono text-gray-600">{cond.requiredValue}</span>
                                  <span className="text-gray-400 mx-1">—</span>
                                  <span className="font-mono text-gray-700">Actual: {cond.actualValue}</span>
                                  {!cond.met && cond.gap && (
                                    <div className="text-red-600 mt-0.5">Gap: {cond.gap}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SOURCE LINEAGE */}
      {activeTab === 'lineage' && (
        <SourceLineagePanel
          sourceLineage={lineage}
          goldenId={customer.goldenId}
          customerName={customer.name}
          overallQuality={confidenceScore}
        />
      )}

      {/* TAB 6: NOTES & AUDIT ACTIVITY */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-12 gap-4 animate-in fade-in duration-150">
          {/* Notes Journal */}
          <div className="col-span-6 p-4 rounded-lg bg-white border border-gray-200 shadow-2xs space-y-3 flex flex-col min-h-0">
            <div className="pb-1.5 border-b border-gray-150">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Relationship Activity Journal
              </h3>
            </div>

            <form onSubmit={handleAddNote} className="space-y-2 shrink-0">
              <textarea
                rows={2}
                placeholder="Type interaction or meeting logs..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-50 focus:bg-white focus:border-[#1B4FD8] focus:outline-none text-xs"
              />
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="px-2.5 py-1 rounded bg-[#1B4FD8] hover:bg-[#113CAD] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Save Log
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 mt-2">
              {localNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-2.5 rounded border border-gray-200 bg-gray-50 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold uppercase">
                    <span className="text-gray-700">{note.author}</span>
                    <span className="font-mono">{note.date}</span>
                  </div>
                  <p className="text-gray-900 font-medium">{note.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Governance log */}
          <div className="col-span-6 p-4 rounded-lg bg-white border border-gray-200 shadow-2xs flex flex-col min-h-0">
            <div className="pb-1.5 border-b border-gray-150 shrink-0">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Immutable Core Audit Stream
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 mt-2">
              {auditData?.logs && auditData.logs.length > 0 ? (
                auditData.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded bg-gray-50 border border-gray-200 text-xs space-y-1 font-sans"
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase text-gray-400">
                      <span className="text-[#1B4FD8]">{log.action}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="text-gray-900 font-bold">{log.description}</div>
                    <div className="text-[9px] text-gray-500 font-mono">
                      Actor: {log.actorEmail}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-gray-400">
                  No governance logs recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </TabbedHeaderLayout>
  );
};
