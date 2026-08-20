import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Building2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Layers,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  FileText,
  AlertTriangle,
  Database,
  History,
  CheckCircle2,
  Plus,
  Send,
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
  ArrowUpRight,
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
import { OpportunityCard } from '../components/opportunity/OpportunityCard';
import { TabbedHeaderLayout, TabItem } from '../components/layout/TabbedHeaderLayout';
import { formatCurrency, formatDate } from '../lib/utils';
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
      <div className="p-12 text-center text-[#68717C] font-mono text-xs">
        Loading unified Golden Customer Profile...
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-[#B84242] font-bold text-base">
          Customer Profile Not Found ({goldenId})
        </div>
        <button
          onClick={() => navigate('/customers')}
          className="px-4 py-2 rounded-md bg-[#ECEAE4] hover:bg-[#D8D5CD] text-[#20252B] text-xs font-semibold cursor-pointer border border-[#D8D5CD]"
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

  const demoQuickCustomers = [
    { id: 'CUST-001', name: 'Amit Kumar', tag: 'Clean Auto-Merge' },
    { id: 'CUST-002', name: 'Priya Nair', tag: 'HNI Multi-Silo' },
    { id: 'CUST-003', name: 'Rajesh Patel', tag: 'City Override' },
    { id: 'CUST-004', name: 'Rahul Sharma', tag: '84% In Review' },
  ];

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
      badge: 5,
      badgeTone: 'amber',
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: Sparkles,
      badge: 5,
      badgeTone: 'green',
    },
    {
      id: 'lineage',
      label: 'Source Lineage',
      icon: Database,
      badge: 3,
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
    <div className="p-6 space-y-4">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D5CD] pb-4">
        <div>
          <div className="text-[11px] text-[#68717C] flex items-center gap-1.5 font-medium">
            <span className="hover:underline cursor-pointer" onClick={() => navigate('/customers')}>Customers</span>
            <span>&gt;</span>
            <span className="font-mono text-[#2457A6]">{goldenId}</span>
            <span>&gt;</span>
            <span className="capitalize text-[#20252B] font-semibold">
              {tabs.find((t) => t.id === activeTab)?.label || 'Overview'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#20252B] tracking-tight mt-1">
            Customer 360 — {tabs.find((t) => t.id === activeTab)?.label || 'Overview'}
          </h2>
          <p className="text-xs text-[#68717C] mt-0.5">
            {activeTab === 'overview' && 'Unified golden view of the customer and relationship summary.'}
            {activeTab === 'evidence' && 'View and validate all identity documents and evidence linked to this customer.'}
            {activeTab === 'conflicts' && 'View potential matches, overlaps and conflicts detected for this customer.'}
            {activeTab === 'opportunities' && 'Next-best opportunities identified for this customer based on profile, behavior and product affinity.'}
            {activeTab === 'lineage' && 'Track the origin of customer data and how it flows across systems to build the golden record.'}
            {activeTab === 'notes' && 'Record relationship notes, advisory logs and review the immutable audit trail.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/review')}
            className="px-3.5 py-1.5 rounded-md bg-[#FFFFFF] hover:bg-[#ECEAE4] border border-[#D8D5CD] text-[#20252B] text-xs font-semibold cursor-pointer shadow-2xs"
          >
            View in Review Queue
          </button>
          <button
            onClick={() => navigate('/customers')}
            className="px-3.5 py-1.5 rounded-md bg-[#2457A6] hover:bg-[#183B70] text-white text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <span>Edit / Open Details</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Customer Hero Summary Bar */}
      <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#D8D5CD] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
        {/* Col 1: Identity Avatar & Name */}
        <div className="lg:col-span-2 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#EBF1FA] text-[#2457A6] border border-[#BCD1F0] flex items-center justify-center font-bold text-lg shrink-0">
            {customer.name?.charAt(0) || 'R'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#20252B] tracking-tight">{customer.name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#EBF4EF] text-[#287A52] border border-[#A8D3BC] text-[10px] font-bold">
                Active
              </span>
            </div>
            <div className="text-xs text-[#68717C] flex items-center gap-2 mt-0.5">
              <span>Golden Customer ID:</span>
              <span className="font-mono font-bold text-[#20252B]">{customer.goldenId}</span>
            </div>
            <div className="text-[11px] text-[#68717C] flex items-center gap-3 mt-1 font-mono">
              <span>Primary Mobile: {customer.mobile || '98765 43210'}</span>
              <span>•</span>
              <span>Primary PAN: {customer.pan || 'ABCDE1234F'}</span>
            </div>
          </div>
        </div>

        {/* Col 2: Identity Confidence */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#68717C] font-medium">Identity Confidence</span>
            <span className="font-mono font-bold text-base text-[#20252B]">{confidenceScore}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#ECEAE4] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#287A52]"
              style={{ width: `${confidenceScore}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold text-[#287A52] block">High Confidence</span>
        </div>

        {/* Col 3: Sources Linked & Relationship Value */}
        <div className="space-y-1">
          <div className="text-xs text-[#68717C] font-medium">Sources Linked</div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-base text-[#20252B]">3</span>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-[#EBF1FA] text-[#2457A6] font-mono text-[10px] font-bold border border-[#BCD1F0]">EQ</span>
              <span className="px-1.5 py-0.5 rounded bg-[#F2EDFA] text-[#6A3BB8] font-mono text-[10px] font-bold border border-[#D6C7F0]">MF</span>
              <span className="px-1.5 py-0.5 rounded bg-[#EBF4EF] text-[#287A52] font-mono text-[10px] font-bold border border-[#A8D3BC]">LN</span>
            </div>
          </div>
          <div className="text-[10px] text-[#68717C] font-mono">EQ, MF, LN</div>
        </div>

        {/* Col 4: Relationship Value & Customer Since */}
        <div className="space-y-1">
          <div className="text-xs text-[#68717C] font-medium">Relationship Value</div>
          <div className="font-mono text-base font-bold text-[#287A52]">
            {formatCurrency(customer.totalRelationshipValue || 1245000)}
          </div>
          <div className="text-[10px] text-[#68717C]">Total Value</div>
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
      {/* ========================================================
          TAB 1: OVERVIEW (Matching overview.jpg)
         ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Product Portfolio Strip & Asset Allocation */}
          <ProductStrip holdings={holdings} totalRelationshipValue={customer.totalRelationshipValue} />

          {/* Row 1: Product Holdings | Relationship Value Breakdown | Key Identity Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Product Holdings */}
            <div className="p-5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 border-b border-[#D8D5CD] pb-2">
                  <CreditCard className="w-4 h-4 text-[#2457A6]" />
                  <h3 className="text-xs font-bold text-[#20252B] uppercase tracking-wider">
                    Product Holdings
                  </h3>
                </div>

                <div className="divide-y divide-[#ECEAE4] text-xs mt-2">
                  <div className="grid grid-cols-4 py-2 font-bold text-[10px] uppercase tracking-wider text-[#68717C]">
                    <span>Product Type</span>
                    <span>Account / Policy</span>
                    <span>Status</span>
                    <span className="text-right">Value</span>
                  </div>
                  <div className="grid grid-cols-4 py-2 text-[#20252B] items-center">
                    <span className="font-medium">Savings Account</span>
                    <span className="font-mono text-[11px] text-[#68717C]">EQSA0001234</span>
                    <span className="text-[#287A52] font-semibold text-[11px]">● Active</span>
                    <span className="font-mono font-bold text-right">₹2,15,000</span>
                  </div>
                  <div className="grid grid-cols-4 py-2 text-[#20252B] items-center">
                    <span className="font-medium">Current Account</span>
                    <span className="font-mono text-[11px] text-[#68717C]">EQCA0005678</span>
                    <span className="text-[#287A52] font-semibold text-[11px]">● Active</span>
                    <span className="font-mono font-bold text-right">₹1,10,000</span>
                  </div>
                  <div className="grid grid-cols-4 py-2 text-[#20252B] items-center">
                    <span className="font-medium">Mutual Fund</span>
                    <span className="font-mono text-[11px] text-[#68717C]">MFIN12345678</span>
                    <span className="text-[#287A52] font-semibold text-[11px]">● Active</span>
                    <span className="font-mono font-bold text-right">₹6,75,000</span>
                  </div>
                  <div className="grid grid-cols-4 py-2 text-[#20252B] items-center">
                    <span className="font-medium">Term Insurance</span>
                    <span className="font-mono text-[11px] text-[#68717C]">LNINS876543</span>
                    <span className="text-[#287A52] font-semibold text-[11px]">● Active</span>
                    <span className="font-mono font-bold text-right">₹2,45,000</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D8D5CD]">
                <button
                  type="button"
                  className="text-xs text-[#2457A6] hover:underline font-semibold flex items-center justify-between w-full cursor-pointer"
                >
                  <span>View all holdings</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 2: Relationship Value Breakdown */}
            <div className="p-5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 border-b border-[#D8D5CD] pb-2">
                  <TrendingUp className="w-4 h-4 text-[#2457A6]" />
                  <h3 className="text-xs font-bold text-[#20252B] uppercase tracking-wider">
                    Relationship Value Breakdown
                  </h3>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  {/* Donut Chart visual representation */}
                  <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#2457A6]"
                        strokeDasharray="54, 100"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#287A52]"
                        strokeDasharray="17, 100"
                        strokeDashoffset="-54"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#A66A16]"
                        strokeDasharray="20, 100"
                        strokeDashoffset="-71"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#6A3BB8]"
                        strokeDasharray="9, 100"
                        strokeDashoffset="-91"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="font-mono text-xs font-bold text-[#20252B]">₹12,45,000</span>
                      <span className="text-[8px] text-[#68717C] uppercase">Total Value</span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="space-y-1 text-xs flex-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] text-[#20252B]">
                        <span className="w-2 h-2 rounded-full bg-[#2457A6]" />
                        <span>Mutual Funds</span>
                      </span>
                      <span className="font-mono text-[11px] text-[#68717C]">54% (₹6.75L)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] text-[#20252B]">
                        <span className="w-2 h-2 rounded-full bg-[#287A52]" />
                        <span>Savings Accounts</span>
                      </span>
                      <span className="font-mono text-[11px] text-[#68717C]">17% (₹2.15L)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] text-[#20252B]">
                        <span className="w-2 h-2 rounded-full bg-[#A66A16]" />
                        <span>Insurance</span>
                      </span>
                      <span className="font-mono text-[11px] text-[#68717C]">20% (₹2.45L)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] text-[#20252B]">
                        <span className="w-2 h-2 rounded-full bg-[#6A3BB8]" />
                        <span>Current Account</span>
                      </span>
                      <span className="font-mono text-[11px] text-[#68717C]">9% (₹1.10L)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D8D5CD]">
                <button
                  type="button"
                  className="text-xs text-[#2457A6] hover:underline font-semibold flex items-center justify-between w-full cursor-pointer"
                >
                  <span>View value trend</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 3: Key Identity Summary */}
            <div className="p-5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 border-b border-[#D8D5CD] pb-2">
                  <ShieldCheck className="w-4 h-4 text-[#2457A6]" />
                  <h3 className="text-xs font-bold text-[#20252B] uppercase tracking-wider">
                    Key Identity Summary
                  </h3>
                </div>

                <div className="space-y-2 text-xs divide-y divide-[#ECEAE4] mt-2">
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#68717C]">Primary Name</span>
                    <span className="font-bold text-[#20252B]">{customer.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#68717C]">Date of Birth</span>
                    <span className="font-mono text-[#20252B]">14 Feb 1990</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#68717C]">PAN</span>
                    <span className="font-mono font-bold text-[#2457A6]">ABCDE1234F</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#68717C]">Primary Mobile</span>
                    <span className="font-mono text-[#20252B]">98765 43210</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#68717C]">Primary Email</span>
                    <span className="font-mono text-[#20252B]">rahul.sharma@email.com</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#68717C]">Address (Primary)</span>
                    <span className="text-[#20252B] font-medium truncate max-w-[170px]">12, Green Park, New Delhi</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D8D5CD]">
                <button
                  type="button"
                  onClick={() => setActiveTab('evidence')}
                  className="text-xs text-[#2457A6] hover:underline font-semibold flex items-center justify-between w-full cursor-pointer"
                >
                  <span>View full identity</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Source Systems (3) | Recent Activity | Next Best Opportunities (Top 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 4: Source Systems (3) */}
            <div className="p-5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 border-b border-[#D8D5CD] pb-2">
                  <Database className="w-4 h-4 text-[#2457A6]" />
                  <h3 className="text-xs font-bold text-[#20252B] uppercase tracking-wider">
                    Source Systems (3)
                  </h3>
                </div>

                <div className="space-y-3 mt-3">
                  <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#D8D5CD] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#EBF1FA] text-[#2457A6] font-mono text-[10px] font-bold flex items-center justify-center border border-[#BCD1F0]">EQ</span>
                      <span className="text-xs font-bold text-[#20252B]">Equity Core Banking</span>
                    </div>
                    <div className="text-[10px] text-[#68717C] flex items-center justify-between font-mono">
                      <span>Linked: 12 Aug 2019</span>
                      <span>Updated: 20 May 2026</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#D8D5CD] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#F2EDFA] text-[#6A3BB8] font-mono text-[10px] font-bold flex items-center justify-center border border-[#D6C7F0]">MF</span>
                      <span className="text-xs font-bold text-[#20252B]">Mutual Fund System</span>
                    </div>
                    <div className="text-[10px] text-[#68717C] flex items-center justify-between font-mono">
                      <span>Linked: 05 Jan 2021</span>
                      <span>Updated: 18 May 2026</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#D8D5CD] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#EBF4EF] text-[#287A52] font-mono text-[10px] font-bold flex items-center justify-center border border-[#A8D3BC]">LN</span>
                      <span className="text-xs font-bold text-[#20252B]">Loan & Insurance System</span>
                    </div>
                    <div className="text-[10px] text-[#68717C] flex items-center justify-between font-mono">
                      <span>Linked: 22 Mar 2022</span>
                      <span>Updated: 19 May 2026</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D8D5CD]">
                <button
                  type="button"
                  onClick={() => setActiveTab('lineage')}
                  className="text-xs text-[#2457A6] hover:underline font-semibold flex items-center justify-between w-full cursor-pointer"
                >
                  <span>View all sources</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 5: Recent Activity */}
            <div className="p-5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 border-b border-[#D8D5CD] pb-2">
                  <History className="w-4 h-4 text-[#2457A6]" />
                  <h3 className="text-xs font-bold text-[#20252B] uppercase tracking-wider">
                    Recent Activity
                  </h3>
                </div>

                <div className="space-y-3 mt-3 text-xs">
                  <div className="flex items-start gap-2.5 pb-2 border-b border-[#ECEAE4]">
                    <span className="w-2 h-2 rounded-full bg-[#287A52] mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#20252B]">Auto-merge completed with MF system</div>
                      <div className="text-[10px] text-[#68717C] font-mono">20 May 2026, 10:15 AM</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pb-2 border-b border-[#ECEAE4]">
                    <span className="w-2 h-2 rounded-full bg-[#2457A6] mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#20252B]">Email updated from LN system</div>
                      <div className="text-[10px] text-[#68717C] font-mono">18 May 2026, 04:22 PM</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pb-2 border-b border-[#ECEAE4]">
                    <span className="w-2 h-2 rounded-full bg-[#A66A16] mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#20252B]">Address verified from EQ system</div>
                      <div className="text-[10px] text-[#68717C] font-mono">17 May 2026, 11:08 AM</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#6A3BB8] mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#20252B]">Opportunity recommended: ULIP</div>
                      <div className="text-[10px] text-[#68717C] font-mono">16 May 2026, 09:30 AM</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D8D5CD]">
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className="text-xs text-[#2457A6] hover:underline font-semibold flex items-center justify-between w-full cursor-pointer"
                >
                  <span>View all activity</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 6: Next Best Opportunities (Top 2) */}
            <div className="p-5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 border-b border-[#D8D5CD] pb-2">
                  <Sparkles className="w-4 h-4 text-[#2457A6]" />
                  <h3 className="text-xs font-bold text-[#20252B] uppercase tracking-wider">
                    Next Best Opportunities (Top 2)
                  </h3>
                </div>

                <div className="space-y-3 mt-3">
                  <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#D8D5CD] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#287A52]" />
                        <span className="text-xs font-bold text-[#20252B]">Term Insurance (Top-up)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EBF4EF] text-[#287A52] font-bold border border-[#A8D3BC]">
                        High
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#68717C]">Score: <strong className="text-[#20252B]">92%</strong></span>
                      <span className="text-[#287A52] font-bold">₹1,20,000</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('opportunities')}
                      className="w-full py-1 text-center rounded bg-[#FFFFFF] border border-[#D8D5CD] text-[11px] font-semibold text-[#2457A6] hover:bg-[#ECEAE4] cursor-pointer"
                    >
                      View Opportunity
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#D8D5CD] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-[#2457A6]" />
                        <span className="text-xs font-bold text-[#20252B]">SIP in Equity Funds</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FBF4EB] text-[#A66A16] font-bold border border-[#E8CEAB]">
                        Medium
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#68717C]">Score: <strong className="text-[#20252B]">78%</strong></span>
                      <span className="text-[#287A52] font-bold">₹75,000</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('opportunities')}
                      className="w-full py-1 text-center rounded bg-[#FFFFFF] border border-[#D8D5CD] text-[11px] font-semibold text-[#2457A6] hover:bg-[#ECEAE4] cursor-pointer"
                    >
                      View Opportunity
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D8D5CD]">
                <button
                  type="button"
                  onClick={() => setActiveTab('opportunities')}
                  className="text-xs text-[#2457A6] hover:underline font-semibold flex items-center justify-between w-full cursor-pointer"
                >
                  <span>View all opportunities</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: IDENTITY EVIDENCE (Matching identity_evidence.jpg)
         ======================================================== */}
      {activeTab === 'evidence' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200 items-start">
          {/* Left 3 Cols: Evidence Categories Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-[#20252B] uppercase tracking-wider border-b border-[#D8D5CD] pb-2">
                Evidence Categories
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
                    className={`w-full flex items-center justify-between p-2 rounded-md font-medium transition-colors cursor-pointer ${
                      evidenceCategory === cat.id
                        ? 'bg-[#EBF1FA] text-[#2457A6] font-bold border border-[#BCD1F0]'
                        : 'text-[#20252B] hover:bg-[#ECEAE4]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="font-mono text-[11px] text-[#68717C]">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-[#20252B] uppercase tracking-wider border-b border-[#D8D5CD] pb-2">
                Quick Actions
              </h4>
              <div className="space-y-1.5 text-xs">
                <button className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#ECEAE4] text-[#2457A6] font-semibold cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Evidence</span>
                </button>
                <button className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#ECEAE4] text-[#20252B] cursor-pointer">
                  <CheckCircle className="w-3.5 h-3.5 text-[#287A52]" />
                  <span>Verify All</span>
                </button>
                <button className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#ECEAE4] text-[#20252B] cursor-pointer">
                  <Download className="w-3.5 h-3.5 text-[#68717C]" />
                  <span>Download All</span>
                </button>
                <button className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#ECEAE4] text-[#20252B] cursor-pointer">
                  <History className="w-3.5 h-3.5 text-[#68717C]" />
                  <span>Evidence History</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 9 Cols: Mathematical Breakdown & Document Registry */}
          <div className="lg:col-span-9 space-y-4">
            {/* Mathematical Identity Evidence & Field Reasoning Breakdown */}
            <IdentityEvidenceTable
              evidence={evidence}
              overallConfidence={confidenceScore}
            />

            {/* Filter Bar */}
            <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#68717C] font-semibold">Evidence Type:</span>
                  <select
                    value={evidenceTypeFilter}
                    onChange={(e) => setEvidenceTypeFilter(e.target.value)}
                    className="p-1.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-[#20252B] text-xs"
                  >
                    <option>All</option>
                    <option>PAN Card</option>
                    <option>Aadhaar Card</option>
                    <option>Address Proof</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[#68717C] font-semibold">Verification Status:</span>
                  <select
                    value={evidenceStatusFilter}
                    onChange={(e) => setEvidenceStatusFilter(e.target.value)}
                    className="p-1.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-[#20252B] text-xs"
                  >
                    <option>All</option>
                    <option>Verified</option>
                    <option>Pending Review</option>
                    <option>Expired</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[#68717C] font-semibold">Source System:</span>
                  <select className="p-1.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-[#20252B] text-xs">
                    <option>All</option>
                    <option>EQ (Equity)</option>
                    <option>MF (Mutual Fund)</option>
                    <option>LN (Loans)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-[#20252B] font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>
                <button className="px-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-[#68717C] hover:text-[#20252B] cursor-pointer">
                  Reset
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D8D5CD] bg-[#ECEAE4] text-[#68717C] uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Evidence Type</th>
                      <th className="py-3 px-4">Document / Detail</th>
                      <th className="py-3 px-4 text-center">Source System</th>
                      <th className="py-3 px-4">Verified On</th>
                      <th className="py-3 px-4">Verification Status</th>
                      <th className="py-3 px-4 text-center">Confidence</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8D5CD] text-[#20252B]">
                    {evidenceList
                      .filter((item) => evidenceCategory === 'all' || item.category === evidenceCategory)
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAF9F6] transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#20252B]">
                            <div>{item.type}</div>
                            <div className="text-[10px] text-[#68717C] font-normal">{item.subtitle}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono font-medium text-[#20252B]">{item.docDetail}</div>
                            <div className="text-[10px] text-[#68717C]">{item.name}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-[#EBF1FA] text-[#2457A6] font-mono text-[10px] font-bold border border-[#BCD1F0]">
                              {item.source}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-[#68717C]">
                            <div>{item.verifiedOn}</div>
                            {item.verifiedSub && (
                              <div className="text-[10px] text-[#287A52] font-semibold">{item.verifiedSub}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {item.status === 'Verified' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBF4EF] text-[#287A52] border border-[#A8D3BC] text-[11px] font-semibold">
                                <CheckCircle className="w-3 h-3" />
                                <span>Verified</span>
                              </span>
                            )}
                            {item.status === 'Pending Review' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FBF4EB] text-[#A66A16] border border-[#E8CEAB] text-[11px] font-semibold">
                                <Clock className="w-3 h-3" />
                                <span>Pending Review</span>
                              </span>
                            )}
                            {item.status === 'Expired' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F9ECEC] text-[#B84242] border border-[#E8B8B8] text-[11px] font-semibold">
                                <XCircle className="w-3 h-3" />
                                <span>Expired</span>
                              </span>
                            )}
                            {item.status === 'Not Verified' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECEAE4] text-[#68717C] border border-[#D8D5CD] text-[11px] font-semibold">
                                <HelpCircle className="w-3 h-3" />
                                <span>Not Verified</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold">
                            {item.confidence > 0 ? (
                              <span className="text-[#287A52]">● {item.confidence}%</span>
                            ) : (
                              <span className="text-[#68717C]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2 text-[#68717C]">
                              <button className="p-1 hover:text-[#20252B] cursor-pointer">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1 hover:text-[#20252B] cursor-pointer">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-[#ECEAE4]/40 border-t border-[#D8D5CD] flex items-center justify-between text-xs text-[#68717C]">
                <span>Showing 1 to 8 of 8 evidence records</span>
                <div className="flex items-center gap-2">
                  <span>Rows per page: 10</span>
                  <span>1 of 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: ATTRIBUTE CONFLICTS (Matching conflicts.jpg)
         ======================================================== */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top 4 Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#F9ECEC] text-[#B84242]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#68717C] uppercase">Total Conflicts</span>
                <div className="font-mono text-xl font-bold text-[#20252B]">5</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#F9ECEC] text-[#B84242]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#68717C] uppercase">High Risk</span>
                <div className="font-mono text-xl font-bold text-[#B84242]">2</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#FBF4EB] text-[#A66A16]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#68717C] uppercase">Medium Risk</span>
                <div className="font-mono text-xl font-bold text-[#A66A16]">2</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#EBF4EF] text-[#287A52]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#68717C] uppercase">Low Risk</span>
                <div className="font-mono text-xl font-bold text-[#287A52]">1</div>
              </div>
            </div>
          </div>

          {/* Live Attribute Conflict Resolution & Admin Override Console */}
          <AttributeConflictCard goldenId={customer.goldenId} conflicts={conflicts} />

          {/* Filter Bar */}
          <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[#68717C] font-semibold">Conflict Type:</span>
                <select
                  value={conflictTypeFilter}
                  onChange={(e) => setConflictTypeFilter(e.target.value)}
                  className="p-1.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-[#20252B] text-xs"
                >
                  <option>All</option>
                  <option>Duplicate PAN</option>
                  <option>Shared Mobile</option>
                  <option>Address Overlap</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#68717C] font-semibold">Source System:</span>
                <select className="p-1.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-[#20252B] text-xs">
                  <option>All</option>
                  <option>EQ</option>
                  <option>MF</option>
                  <option>LN</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#68717C] font-semibold">Status:</span>
                <select
                  value={conflictStatusFilter}
                  onChange={(e) => setConflictStatusFilter(e.target.value)}
                  className="p-1.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-[#20252B] text-xs"
                >
                  <option>All</option>
                  <option>Open</option>
                  <option>In Review</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-[#20252B] font-semibold flex items-center gap-1.5 cursor-pointer">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
              <button className="px-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-[#68717C] hover:text-[#20252B] cursor-pointer">
                Reset
              </button>
            </div>
          </div>

          {/* Conflicts Table */}
          <div className="rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D8D5CD] bg-[#ECEAE4] text-[#68717C] uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Conflict ID</th>
                    <th className="py-3 px-4">Conflict Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Matched With</th>
                    <th className="py-3 px-4 text-center">Source System</th>
                    <th className="py-3 px-4 text-center">Risk Level</th>
                    <th className="py-3 px-4">Detected On</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D5CD] text-[#20252B]">
                  {conflictList.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#2457A6]">
                        {item.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#20252B]">
                        {item.type}
                      </td>
                      <td className="py-3 px-4 text-[#68717C]">
                        {item.description}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#20252B]">{item.matchedWith}</div>
                        <div className="text-[10px] text-[#68717C] font-mono">{item.matchedSub}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-[#EBF1FA] text-[#2457A6] font-mono text-[10px] font-bold border border-[#BCD1F0]">
                          {item.source}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.risk === 'High' && (
                          <span className="px-2 py-0.5 rounded-full bg-[#F9ECEC] text-[#B84242] border border-[#E8B8B8] text-[10px] font-bold">
                            High
                          </span>
                        )}
                        {item.risk === 'Medium' && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FBF4EB] text-[#A66A16] border border-[#E8CEAB] text-[10px] font-bold">
                            Medium
                          </span>
                        )}
                        {item.risk === 'Low' && (
                          <span className="px-2 py-0.5 rounded-full bg-[#EBF4EF] text-[#287A52] border border-[#A8D3BC] text-[10px] font-bold">
                            Low
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-[#68717C]">
                        {item.detectedOn}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.status === 'Open'
                            ? 'bg-[#EBF1FA] text-[#2457A6] border border-[#BCD1F0]'
                            : 'bg-[#FBF4EB] text-[#A66A16] border border-[#E8CEAB]'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-[#68717C]">
                          <button className="p-1 hover:text-[#20252B] cursor-pointer">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 hover:text-[#20252B] cursor-pointer">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#ECEAE4]/40 border-t border-[#D8D5CD] flex items-center justify-between text-xs text-[#68717C]">
              <span>Showing 1 to 5 of 5 conflict records</span>
              <div className="flex items-center gap-2">
                <span>Rows per page: 10</span>
                <span>1 of 1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: OPPORTUNITIES (Matching opportunities.jpg)
         ======================================================== */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#20252B]">
                Next-best opportunities for {customer.name}
              </h3>
              <p className="text-xs text-[#68717C] mt-0.5">
                AI-driven recommendations based on customer profile, relationship value, behavior and eligibility.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#68717C] font-mono">Last evaluated: 20 May 2026, 10:20 AM</span>
              <button className="px-2.5 py-1 rounded bg-[#ECEAE4] border border-[#D8D5CD] text-[#20252B] font-semibold flex items-center gap-1 cursor-pointer">
                <RotateCcw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Opportunities Table / List */}
          <div className="rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D8D5CD] bg-[#ECEAE4] text-[#68717C] uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Opportunity</th>
                    <th className="py-3 px-4 text-center">Scores</th>
                    <th className="py-3 px-4">Potential Value</th>
                    <th className="py-3 px-4">Eligibility Conditions</th>
                    <th className="py-3 px-4">Why?</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D5CD] text-[#20252B]">
                  {fullOpportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-xs text-[#20252B]">{opp.title}</div>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${
                            opp.priority.includes('High')
                              ? 'bg-[#EBF4EF] text-[#287A52] border-[#A8D3BC]'
                              : opp.priority.includes('Medium')
                              ? 'bg-[#FBF4EB] text-[#A66A16] border-[#E8CEAB]'
                              : 'bg-[#ECEAE4] text-[#68717C] border-[#D8D5CD]'
                          }`}>
                            {opp.priority}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#68717C] mt-0.5">{opp.subtitle}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="w-8 h-8 rounded-full border-2 border-[#287A52] text-[#20252B] font-mono font-bold text-xs flex items-center justify-center mx-auto">
                          {opp.score}
                        </div>
                        <span className="text-[9px] text-[#68717C] font-semibold mt-0.5 block">
                          {opp.scoreTone}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-sm text-[#287A52]">{opp.potentialValue}</div>
                        <div className="text-[10px] text-[#68717C]">{opp.potentialLabel}</div>
                      </td>

                      <td className="py-3.5 px-4 space-y-1">
                        {opp.conditions.map((cond, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-1 text-[11px] text-[#20252B]">
                            <CheckCircle2 className="w-3 h-3 text-[#287A52] shrink-0" />
                            <span>{cond}</span>
                          </div>
                        ))}
                      </td>

                      <td className="py-3.5 px-4 max-w-[280px]">
                        <div className="text-[11px] text-[#20252B] leading-relaxed">
                          {opp.why}
                        </div>
                        {opp.moreReasons && (
                          <button className="text-[10px] font-semibold text-[#2457A6] hover:underline mt-1 block cursor-pointer">
                            {opp.moreReasons}
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-y-1">
                        <button className="px-3 py-1 rounded bg-[#2457A6] hover:bg-[#183B70] text-white text-xs font-semibold shadow-2xs cursor-pointer block w-full text-center">
                          Initiate
                        </button>
                        <button className="px-3 py-1 rounded bg-[#FFFFFF] hover:bg-[#ECEAE4] text-[#68717C] hover:text-[#20252B] text-[11px] border border-[#D8D5CD] cursor-pointer block w-full text-center">
                          ✕ Dismiss
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#ECEAE4]/40 border-t border-[#D8D5CD] flex items-center justify-between text-xs text-[#68717C]">
              <span>Showing 1 to 5 of 5 opportunities</span>
              <div className="flex items-center gap-2">
                <span>Rows per page: 10</span>
                <span>1 of 1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: SOURCE LINEAGE (Matching source_lineage.jpg)
         ======================================================== */}
      {activeTab === 'lineage' && (
        <SourceLineagePanel
          sourceLineage={lineage}
          goldenId={customer.goldenId}
          customerName={customer.name}
          createdOn="12 Aug 2019, 11:23 AM"
          lastUpdated="20 May 2026, 10:05 AM"
          overallQuality={96}
        />
      )}

      {/* ========================================================
          TAB 6: NOTES & AUDIT ACTIVITY
         ======================================================== */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* RM Notes Journal */}
          <div className="p-5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-4">
            <div className="pb-2 border-b border-[#D8D5CD]">
              <h3 className="text-xs font-bold text-[#20252B] uppercase tracking-wider">
                Relationship Notes & Activity Journal
              </h3>
              <p className="text-[11px] text-[#68717C]">
                Record client interactions, advisory meeting notes, and compliance follow-ups.
              </p>
            </div>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={3}
                placeholder="Type advisory note, conversation summary or action item..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full p-2.5 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-xs text-[#20252B] placeholder-[#68717C] focus:border-[#2457A6] focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="px-3.5 py-1.5 rounded-md bg-[#2457A6] hover:bg-[#183B70] text-white text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Note to Profile</span>
              </button>
            </form>

            <div className="space-y-3 pt-2">
              {localNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-md border border-[#D8D5CD] bg-[#ECEAE4]/50 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#68717C]">
                    <span className="font-bold text-[#20252B]">{note.author}</span>
                    <span className="font-mono">{note.date}</span>
                  </div>
                  <p className="text-[#20252B] leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Golden Record Audit Stream */}
          <div className="p-5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-4">
            <div className="pb-2 border-b border-[#D8D5CD]">
              <h3 className="text-xs font-bold text-[#20252B] uppercase tracking-wider">
                Immutable Governance & Audit Trail
              </h3>
              <p className="text-[11px] text-[#68717C]">
                Security logs matching decisions, conflict overrides, and opportunity status modifications.
              </p>
            </div>

            <div className="space-y-2.5">
              {auditData?.logs && auditData.logs.length > 0 ? (
                auditData.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-md bg-[#ECEAE4]/40 border border-[#D8D5CD] text-xs space-y-1 font-sans"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#68717C]">
                      <span className="font-bold text-[#2457A6] uppercase">{log.action}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="text-[#20252B] font-medium">{log.description}</div>
                    <div className="text-[10px] text-[#68717C] font-mono">
                      Actor: {log.actorEmail} ({log.actorRole})
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-[#68717C]">
                  No audit logs recorded yet for Golden ID {customer.goldenId}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </TabbedHeaderLayout>
  );
};
