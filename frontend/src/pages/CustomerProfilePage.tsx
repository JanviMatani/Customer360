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

  const confidenceScore = customer.confidenceScore ?? customer.matchConfidence ?? 96;
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
  const evidenceList = [
    {
      id: 'ev-1',
      category: 'primary',
      type: 'PAN Card',
      subtitle: 'Primary Identity',
      docDetail: 'ABCDE1234F',
      name: 'Rahul Sharma',
      source: 'EQ',
      verifiedOn: '20 May 2026, 10:15 AM',
      verifiedSub: 'Auto Verified',
      status: 'Verified',
      confidence: 98,
    },
    {
      id: 'ev-2',
      category: 'primary',
      type: 'Aadhaar Card',
      subtitle: 'Primary Identity',
      docDetail: 'XXXX XXXX 4321',
      name: 'Rahul Sharma',
      source: 'EQ',
      verifiedOn: '20 May 2026, 10:14 AM',
      verifiedSub: 'Auto Verified',
      status: 'Verified',
      confidence: 96,
    },
    {
      id: 'ev-3',
      category: 'address',
      type: 'Address Proof',
      subtitle: 'Utility Bill',
      docDetail: 'Electricity Bill - Aug 2025',
      name: 'Rahul Sharma',
      source: 'EQ',
      verifiedOn: '18 May 2026, 04:22 PM',
      verifiedSub: 'Auto Verified',
      status: 'Verified',
      confidence: 92,
    },
    {
      id: 'ev-4',
      category: 'contact',
      type: 'Mobile Number',
      subtitle: 'Contact Evidence',
      docDetail: '98765 43210',
      name: 'Primary Mobile',
      source: 'EQ',
      verifiedOn: '18 May 2026, 04:21 PM',
      verifiedSub: 'OTP Verified',
      status: 'Verified',
      confidence: 95,
    },
    {
      id: 'ev-5',
      category: 'contact',
      type: 'Email Address',
      subtitle: 'Contact Evidence',
      docDetail: 'rahul.sharma@email.com',
      name: 'Primary Email',
      source: 'MF',
      verifiedOn: '17 May 2026, 11:08 AM',
      verifiedSub: 'Email Verified',
      status: 'Verified',
      confidence: 93,
    },
    {
      id: 'ev-6',
      category: 'financial',
      type: 'Bank Statement',
      subtitle: 'Financial Evidence',
      docDetail: 'Savings A/c Statement',
      name: 'Mar 2026',
      source: 'EQ',
      verifiedOn: '16 May 2026, 09:30 AM',
      verifiedSub: 'Document Verified',
      status: 'Pending Review',
      confidence: 85,
    },
    {
      id: 'ev-7',
      category: 'primary',
      type: 'Passport',
      subtitle: 'Primary Identity',
      docDetail: 'P1234567',
      name: 'Rahul Sharma',
      source: 'LN',
      verifiedOn: 'Not Verified',
      verifiedSub: '',
      status: 'Not Verified',
      confidence: 0,
    },
    {
      id: 'ev-8',
      category: 'address',
      type: 'Address Proof',
      subtitle: 'Utility Bill',
      docDetail: 'Water Bill - Jul 2024',
      name: '12, Green Park, New Delhi',
      source: 'LN',
      verifiedOn: 'Not Verified',
      verifiedSub: '',
      status: 'Expired',
      confidence: 0,
    },
  ];

  // Conflict list according to conflicts.jpg
  const conflictList = [
    {
      id: 'CNF-000123',
      type: 'Duplicate PAN',
      description: 'Same PAN linked to multiple customer profiles',
      matchedWith: 'Amit Verma',
      matchedSub: 'PAN: ABCDE1234F',
      source: 'EQ',
      risk: 'High',
      detectedOn: '20 May 2026, 10:18 AM',
      status: 'Open',
    },
    {
      id: 'CNF-000124',
      type: 'Shared Mobile',
      description: 'Mobile number used by multiple customers',
      matchedWith: 'Priya Mehta',
      matchedSub: 'Mobile: 98765 43210',
      source: 'MF',
      risk: 'Medium',
      detectedOn: '20 May 2026, 10:17 AM',
      status: 'Open',
    },
    {
      id: 'CNF-000125',
      type: 'Address Overlap',
      description: 'High similarity in address with another customer',
      matchedWith: 'Neha Iyer',
      matchedSub: 'Address: 12, Green Park...',
      source: 'LN',
      risk: 'Medium',
      detectedOn: '19 May 2026, 04:35 PM',
      status: 'In Review',
    },
    {
      id: 'CNF-000126',
      type: 'Name Similarity',
      description: 'High similarity in name (Phonetic match)',
      matchedWith: 'Rahul Sharmaa',
      matchedSub: 'Similarity Score: 92%',
      source: 'EQ',
      risk: 'Low',
      detectedOn: '18 May 2026, 02:21 PM',
      status: 'Open',
    },
    {
      id: 'CNF-000127',
      type: 'Email Overlap',
      description: 'Email address used by another customer',
      matchedWith: 'Vikram Singh',
      matchedSub: 'Email: rahul.sharma@email.com',
      source: 'MF',
      risk: 'High',
      detectedOn: '17 May 2026, 11:08 AM',
      status: 'Open',
    },
  ];

  // Opportunities list according to opportunities.jpg
  const fullOpportunities = [
    {
      id: 'opp-1',
      title: 'Term Insurance Plan',
      priority: 'High Priority',
      subtitle: "Protect your family's future",
      score: 92,
      scoreTone: 'Very High',
      potentialValue: '₹1,20,000',
      potentialLabel: 'Annual Premium',
      conditions: ['Age 30–50', 'Income > ₹5 LPA', 'No existing term plan'],
      why: "You don't have a term insurance plan. This plan can provide ₹1 Cr cover at an affordable premium.",
      moreReasons: '+2 more reasons',
    },
    {
      id: 'opp-2',
      title: 'SIP in Equity Funds',
      priority: 'High Priority',
      subtitle: 'Grow wealth with disciplined investing',
      score: 88,
      scoreTone: 'Very High',
      potentialValue: '₹75,000',
      potentialLabel: 'Est. 1 Year Value',
      conditions: ['Investment horizon > 3 yrs', 'Risk appetite: Moderate to High', 'No active SIP'],
      why: 'Your investment horizon and risk profile are suitable for equity funds. SIPs can help you build long-term wealth.',
      moreReasons: '+1 more reason',
    },
    {
      id: 'opp-3',
      title: 'Premium Credit Card',
      priority: 'Medium Priority',
      subtitle: 'Earn more rewards & lifestyle benefits',
      score: 72,
      scoreTone: 'High',
      potentialValue: '₹12,000',
      potentialLabel: 'Est. Annual Benefits',
      conditions: ['Income > ₹4 LPA', 'Good credit profile', 'No premium card'],
      why: 'You can earn up to 12,000 reward points annually along with airport lounge and dining benefits.',
      moreReasons: '',
    },
    {
      id: 'opp-4',
      title: 'Home Loan Balance Transfer',
      priority: 'Medium Priority',
      subtitle: 'Lower your EMI and save on interest',
      score: 64,
      scoreTone: 'Medium',
      potentialValue: '₹48,000',
      potentialLabel: 'Est. Annual Savings',
      conditions: ['Active home loan', 'Interest rate > 8%', 'CIBIL score > 750'],
      why: 'You could save up to ₹48,000 per year by transferring your home loan to a lower interest rate.',
      moreReasons: '+1 more reason',
    },
    {
      id: 'opp-5',
      title: 'Personal Loan',
      priority: 'Low Priority',
      subtitle: 'Funds for your personal needs',
      score: 38,
      scoreTone: 'Low',
      potentialValue: '₹2,00,000',
      potentialLabel: 'Loan Amount',
      conditions: ['Income > ₹3 LPA', 'Existing relationship > 1 yr', 'KYC up to date'],
      why: 'You may be eligible for a personal loan with competitive interest rates for your needs.',
      moreReasons: '',
    },
  ];

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
              <span>Mobile: {customer.mobile || '98765 43210'}</span>
              <span>•</span>
              <span>PAN: {customer.pan || 'ABCDE1234F'}</span>
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
            {formatCurrency(customer.totalRelationshipValue || 1245000)}
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
            {/* Card 1: Product Holdings */}
            <div className="col-span-4 p-4 rounded-lg bg-white border border-gray-200 shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <CreditCard size={14} className="text-[#1B4FD8]" />
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Holdings Details
                  </h3>
                </div>

                <div className="divide-y divide-gray-50 text-[11px] mt-2">
                  <div className="grid grid-cols-4 py-1.5 font-bold uppercase tracking-wider text-gray-400 text-[9px]">
                    <span className="col-span-2">Product</span>
                    <span>Status</span>
                    <span className="text-right">Balance</span>
                  </div>
                  <div className="grid grid-cols-4 py-1.5 items-center">
                    <span className="col-span-2 font-bold text-gray-900">Savings Account</span>
                    <span className="text-emerald-700 font-bold">● Active</span>
                    <span className="font-mono text-right font-semibold">₹2,15,000</span>
                  </div>
                  <div className="grid grid-cols-4 py-1.5 items-center">
                    <span className="col-span-2 font-bold text-gray-900">Current Account</span>
                    <span className="text-emerald-700 font-bold">● Active</span>
                    <span className="font-mono text-right font-semibold">₹1,10,000</span>
                  </div>
                  <div className="grid grid-cols-4 py-1.5 items-center">
                    <span className="col-span-2 font-bold text-gray-900">Mutual Fund</span>
                    <span className="text-emerald-700 font-bold">● Active</span>
                    <span className="font-mono text-right font-semibold">₹6,75,000</span>
                  </div>
                  <div className="grid grid-cols-4 py-1.5 items-center">
                    <span className="col-span-2 font-bold text-gray-900">Term Insurance</span>
                    <span className="text-emerald-700 font-bold">● Active</span>
                    <span className="font-mono text-right font-semibold">₹2,45,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Relationship Value Breakdown */}
            <div className="col-span-4 p-4 rounded-lg bg-white border border-gray-200 shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <TrendingUp size={14} className="text-[#1B4FD8]" />
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Asset Allocation
                  </h3>
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#1B4FD8]"
                        strokeDasharray="54, 100"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#10B981]"
                        strokeDasharray="17, 100"
                        strokeDashoffset="-54"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#F59E0B]"
                        strokeDasharray="20, 100"
                        strokeDashoffset="-71"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#6366F1]"
                        strokeDasharray="9, 100"
                        strokeDashoffset="-91"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>

                  <div className="space-y-1 text-[10px] flex-1 font-semibold text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1B4FD8]" />
                        <span>Mutual Funds</span>
                      </span>
                      <span className="font-mono text-gray-500">54%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        <span>Savings Accounts</span>
                      </span>
                      <span className="font-mono text-gray-500">17%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                        <span>Insurance</span>
                      </span>
                      <span className="font-mono text-gray-500">20%</span>
                    </div>
                  </div>
                </div>
              </div>
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
          <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Cross-Sell Recommendations for {customer.name}
              </h3>
              <p className="text-[10px] text-gray-400">
                AI product affinity & financial propensity analytics engine
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white border border-gray-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-4">Recommended Product</th>
                  <th className="py-2.5 px-4 text-center">Propensity Score</th>
                  <th className="py-2.5 px-4 text-right">Potential Value</th>
                  <th className="py-2.5 px-4">Eligibility Mapped</th>
                  <th className="py-2.5 px-4">Justification</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {fullOpportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{opp.title}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{opp.subtitle}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="font-mono font-bold text-[#1B4FD8]">{opp.score}%</div>
                      <span className="text-[9px] text-gray-400 font-semibold">{opp.scoreTone}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {opp.potentialValue}
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      {opp.conditions.slice(0, 2).map((c, i) => (
                        <div key={i} className="flex items-center gap-1 text-[10px] text-gray-600 font-medium">
                          <CheckCircle2 size={10} className="text-emerald-600" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-[10px] text-gray-500 max-w-[200px] truncate leading-relaxed">
                      {opp.why}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="px-2.5 py-1 rounded bg-[#1B4FD8] hover:bg-[#113CAD] text-white text-2xs font-bold cursor-pointer">
                        Offer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SOURCE LINEAGE */}
      {activeTab === 'lineage' && (
        <SourceLineagePanel
          sourceLineage={lineage}
          goldenId={customer.goldenId}
          customerName={customer.name}
          overallQuality={96}
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
