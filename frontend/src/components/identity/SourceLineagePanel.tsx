import React, { useState } from 'react';
import {
  Database,
  Layers,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Server,
  Users,
  BarChart3,
  Megaphone,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { SourceRecord } from '../../types';
import { SourceBadge } from '../shared/SourceBadge';
import { formatCurrency, formatDate } from '../../lib/utils';
import { MaskedField } from '../shared/MaskedField';

interface SourceLineagePanelProps {
  sourceLineage: SourceRecord[];
  goldenId?: string;
  customerName?: string;
  createdOn?: string;
  lastUpdated?: string;
  overallQuality?: number;
}

export const SourceLineagePanel: React.FC<SourceLineagePanelProps> = ({
  sourceLineage,
  goldenId = 'GCUST0001',
  customerName = 'Rahul Sharma',
  createdOn = '12 Aug 2019, 11:23 AM',
  lastUpdated = '20 May 2026, 10:05 AM',
  overallQuality = 96,
}) => {
  // Collapsible sub-sections inside the tab (expanded by default, completely non-blocking)
  const [isFlowExpanded, setIsFlowExpanded] = useState(true);
  const [isTransformationsExpanded, setIsTransformationsExpanded] = useState(true);
  const [isEventsExpanded, setIsEventsExpanded] = useState(true);

  // Lineage events data matching inspiration
  const lineageEvents = [
    {
      id: 'le-1',
      timestamp: '20 May 2026, 10:05 AM',
      event: 'Golden record updated',
      source: 'Customer 360',
      details: 'Merged 3 source updates',
      triggeredBy: 'System',
    },
    {
      id: 'le-2',
      timestamp: '20 May 2026, 09:20 AM',
      event: 'Data extracted',
      source: 'Equity Core Banking',
      details: 'Extracted 1,245 records',
      triggeredBy: 'System',
    },
    {
      id: 'le-3',
      timestamp: '19 May 2026, 07:45 PM',
      event: 'Data extracted',
      source: 'Mutual Fund System',
      details: 'Extracted 832 records',
      triggeredBy: 'System',
    },
    {
      id: 'le-4',
      timestamp: '18 May 2026, 06:35 PM',
      event: 'Data extracted',
      source: 'Loan & Insurance System',
      details: 'Extracted 1,102 records',
      triggeredBy: 'System',
    },
  ];

  const trackedElements = [
    'Name',
    'PAN',
    'Date of Birth',
    'Mobile',
    'Email',
    'Address',
    'KYC Status',
    'Customer Since',
    'Account Type',
    'Segment',
    'Risk Score',
    'More (2)',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Main Top Split: Data Lineage Flow (Left) & Lineage Details Sidebar (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Interactive Visual Pipeline */}
        <div className="xl:col-span-8 space-y-6">
          {/* Data Lineage Flow Diagram Card */}
          <div className="rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#D8D5CD] bg-[#FFFFFF] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#20252B] tracking-tight">
                    Data Lineage Flow
                  </h3>
                  <span
                    title="Shows end-to-end ingestion pipeline from raw silos through staging to downstream synchronization."
                    className="cursor-help"
                  >
                    <Info className="w-3.5 h-3.5 text-[#68717C]" />
                  </span>
                </div>
                <p className="text-[11px] text-[#68717C] mt-0.5">
                  From source systems to Customer 360 golden record
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFlowExpanded(!isFlowExpanded)}
                className="p-1 rounded text-[#68717C] hover:text-[#20252B] hover:bg-[#ECEAE4] cursor-pointer"
                title={isFlowExpanded ? 'Collapse flow diagram' : 'Expand flow diagram'}
              >
                {isFlowExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {isFlowExpanded && (
              <div className="p-5 bg-[#FAF9F6] border-b border-[#D8D5CD] overflow-x-auto">
                <div className="min-w-[680px] grid grid-cols-4 gap-4 items-center">
                  {/* Column 1: Source Systems */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold text-[#68717C] uppercase tracking-wider text-center pb-1">
                      Source Systems
                    </div>

                    {/* Source 1: Equity */}
                    <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-1.5 hover:border-[#2457A6] transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[#EBF1FA] text-[#2457A6] font-mono text-[11px] font-bold flex items-center justify-center border border-[#BCD1F0]">
                          EQ
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#20252B] truncate">
                            Equity Core Banking
                          </div>
                          <div className="text-[10px] text-[#68717C]">Customer Master</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-[#68717C] font-mono border-t border-[#ECEAE4] pt-1 mt-1">
                        Last Updated: 20 May 2026, 09:15 AM
                      </div>
                    </div>

                    {/* Source 2: MF */}
                    <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-1.5 hover:border-[#2457A6] transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[#F2EDFA] text-[#6A3BB8] font-mono text-[11px] font-bold flex items-center justify-center border border-[#D6C7F0]">
                          MF
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#20252B] truncate">
                            Mutual Fund System
                          </div>
                          <div className="text-[10px] text-[#68717C]">Investor Master</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-[#68717C] font-mono border-t border-[#ECEAE4] pt-1 mt-1">
                        Last Updated: 20 May 2026, 07:42 PM
                      </div>
                    </div>

                    {/* Source 3: LN */}
                    <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-1.5 hover:border-[#2457A6] transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[#EBF4EF] text-[#287A52] font-mono text-[11px] font-bold flex items-center justify-center border border-[#A8D3BC]">
                          LN
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#20252B] truncate">
                            Loan & Insurance System
                          </div>
                          <div className="text-[10px] text-[#68717C]">Customer Master</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-[#68717C] font-mono border-t border-[#ECEAE4] pt-1 mt-1">
                        Last Updated: 18 May 2026, 06:30 PM
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Staging / Processing */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold text-[#68717C] uppercase tracking-wider text-center pb-1">
                      Staging / Processing
                    </div>

                    <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Database className="w-4 h-4 text-[#2457A6] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#20252B] truncate">
                            EQ Staging
                          </div>
                          <div className="text-[10px] text-[#68717C]">Extracted 20 May, 09:20 AM</div>
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-[#287A52] shrink-0 ml-1" />
                    </div>

                    <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Database className="w-4 h-4 text-[#6A3BB8] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#20252B] truncate">
                            MF Staging
                          </div>
                          <div className="text-[10px] text-[#68717C]">Extracted 19 May, 07:45 PM</div>
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-[#287A52] shrink-0 ml-1" />
                    </div>

                    <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Database className="w-4 h-4 text-[#287A52] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#20252B] truncate">
                            LN Staging
                          </div>
                          <div className="text-[10px] text-[#68717C]">Extracted 18 May, 06:35 PM</div>
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-[#287A52] shrink-0 ml-1" />
                    </div>
                  </div>

                  {/* Column 3: Customer 360 (Golden Record Center) */}
                  <div className="space-y-3 flex flex-col justify-center">
                    <div className="text-[11px] font-bold text-[#2457A6] uppercase tracking-wider text-center pb-1">
                      Customer 360
                    </div>

                    <div className="p-4 rounded-xl bg-[#FFFFFF] border-2 border-[#2457A6] shadow-sm text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-[#EBF1FA] text-[#2457A6] border border-[#BCD1F0] flex items-center justify-center font-bold text-sm mx-auto">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#68717C] tracking-wider block">
                          Golden Record
                        </span>
                        <div className="font-mono font-bold text-sm text-[#20252B]">
                          {goldenId}
                        </div>
                      </div>
                      <div className="text-[10px] text-[#68717C] border-t border-[#ECEAE4] pt-1.5">
                        Last Consolidated:
                        <div className="font-mono font-medium text-[#20252B] mt-0.5">
                          {lastUpdated}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 4: Downstream Systems */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold text-[#68717C] uppercase tracking-wider text-center pb-1">
                      Downstream Systems
                    </div>

                    <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#2457A6]" />
                        <div className="text-xs font-bold text-[#20252B]">CRM System</div>
                      </div>
                      <div className="text-[10px] text-[#287A52] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#287A52]" />
                        <span>Synced 20 May, 10:10 AM</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#6A3BB8]" />
                        <div className="text-xs font-bold text-[#20252B]">Analytics Platform</div>
                      </div>
                      <div className="text-[10px] text-[#287A52] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#287A52]" />
                        <span>Synced 10 May, 10:12 AM</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-[#A66A16]" />
                        <div className="text-xs font-bold text-[#20252B]">Campaign Engine</div>
                      </div>
                      <div className="text-[10px] text-[#287A52] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#287A52]" />
                        <span>Synced 20 May, 10:15 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Raw System Transformations Accordion (Directly open, cleanly collapsible) */}
          <div className="rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#D8D5CD] bg-[#FFFFFF] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-[#2457A6]" />
                <div>
                  <h4 className="text-xs font-bold text-[#20252B] uppercase tracking-wider">
                    Raw Silo Field Normalization & Transformation
                  </h4>
                  <div className="text-[11px] text-[#68717C]">
                    {sourceLineage.length} contributing operational source systems mapped to this Golden Record
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1">
                  {sourceLineage.map((src, i) => (
                    <SourceBadge key={i} source={src.system} size="sm" />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIsTransformationsExpanded(!isTransformationsExpanded)}
                  className="p-1 rounded text-[#68717C] hover:text-[#20252B] hover:bg-[#ECEAE4] cursor-pointer"
                  title={isTransformationsExpanded ? 'Collapse transformations' : 'Expand transformations'}
                >
                  {isTransformationsExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {isTransformationsExpanded && (
              <div className="p-4 bg-[#FAF9F6] border-b border-[#D8D5CD]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sourceLineage.map((record, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] space-y-3 relative overflow-hidden shadow-2xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#D8D5CD]">
                        <div className="flex items-center gap-1.5">
                          <SourceBadge source={record.system} showFullName size="sm" />
                        </div>
                        <span className="font-mono text-[11px] text-[#20252B] font-bold bg-[#ECEAE4] px-2 py-0.5 rounded border border-[#D8D5CD]">
                          {record.sourceCustomerId}
                        </span>
                      </div>

                      <div className="space-y-2 text-[11px]">
                        {/* Name transformation */}
                        <div className="p-2 rounded-md bg-[#ECEAE4]/50 border border-[#D8D5CD]">
                          <span className="text-[#68717C] block mb-0.5 font-medium">Name (Raw → Normalized):</span>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-[#B84242] truncate max-w-[100px]">{record.rawName}</span>
                            <ArrowRight className="w-3 h-3 text-[#68717C] shrink-0" />
                            <span className="text-[#287A52] font-bold truncate">{record.normalizedName}</span>
                          </div>
                        </div>

                        {/* Mobile transformation */}
                        <div className="p-2 rounded-md bg-[#ECEAE4]/50 border border-[#D8D5CD]">
                          <span className="text-[#68717C] block mb-0.5 font-medium">Mobile (Raw → Normalized):</span>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-[#68717C]">{record.rawMobile}</span>
                            <ArrowRight className="w-3 h-3 text-[#68717C] shrink-0" />
                            <MaskedField value={record.normalizedMobile} type="mobile" />
                          </div>
                        </div>

                        {/* PAN transformation */}
                        {record.rawPan && (
                          <div className="p-2 rounded-md bg-[#ECEAE4]/50 border border-[#D8D5CD]">
                            <span className="text-[#68717C] block mb-0.5 font-medium">PAN (Raw → Clean):</span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <MaskedField value={record.rawPan} type="pan" />
                            </div>
                          </div>
                        )}

                        {/* DOB transformation */}
                        {record.rawDob && (
                          <div className="p-2 rounded-md bg-[#ECEAE4]/50 border border-[#D8D5CD]">
                            <span className="text-[#68717C] block mb-0.5 font-medium">DOB (Standardized):</span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="text-[#68717C]">{record.rawDob}</span>
                              <ArrowRight className="w-3 h-3 text-[#68717C] shrink-0" />
                              <span className="text-[#2457A6] font-semibold">{record.normalizedDob}</span>
                            </div>
                          </div>
                        )}

                        {/* Financial Holding in this Silo */}
                        <div className="flex items-center justify-between pt-1 border-t border-[#D8D5CD] text-xs">
                          <span className="text-[#68717C]">Silo Balance:</span>
                          <span className="font-mono font-bold text-[#287A52]">
                            {formatCurrency(record.balance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Lineage Details, Data Quality, and Data Elements Tracked */}
        <div className="xl:col-span-4 space-y-4">
          {/* Card 1: Lineage Details */}
          <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-[#20252B] uppercase tracking-wider border-b border-[#D8D5CD] pb-2">
              Lineage Details
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#68717C]">Golden Customer ID</span>
                <span className="font-mono font-bold text-[#2457A6]">{goldenId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#68717C]">Customer Name</span>
                <span className="font-bold text-[#20252B]">{customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#68717C]">Record Created On</span>
                <span className="font-mono text-[#20252B]">{createdOn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#68717C]">Last Consolidated</span>
                <span className="font-mono text-[#20252B]">{lastUpdated}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#68717C]">Consolidation Frequency</span>
                <span className="font-semibold text-[#287A52]">Real-time</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#68717C]">Consolidation Rules Version</span>
                <span className="font-mono text-[#20252B]">v2.8.1</span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#D8D5CD]">
              <a
                href="/config"
                className="text-xs text-[#2457A6] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View consolidation rules</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Card 2: Data Quality Summary */}
          <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-[#20252B] uppercase tracking-wider border-b border-[#D8D5CD] pb-2">
              Data Quality Summary
            </h4>
            <div className="flex items-center gap-4">
              {/* Radial Score Gauge */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#ECEAE4]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#287A52]"
                    strokeDasharray={`${overallQuality}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-base font-bold text-[#20252B]">
                    {overallQuality}%
                  </span>
                  <span className="text-[8px] text-[#68717C] uppercase font-bold tracking-tight">
                    Overall
                  </span>
                </div>
              </div>

              {/* Quality Distribution */}
              <div className="space-y-1.5 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#20252B]">
                    <span className="w-2 h-2 rounded-full bg-[#287A52]" />
                    <span>High Quality</span>
                  </span>
                  <span className="font-mono font-bold text-[#20252B]">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#20252B]">
                    <span className="w-2 h-2 rounded-full bg-[#A66A16]" />
                    <span>Medium Quality</span>
                  </span>
                  <span className="font-mono font-bold text-[#20252B]">6%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#20252B]">
                    <span className="w-2 h-2 rounded-full bg-[#B84242]" />
                    <span>Low Quality</span>
                  </span>
                  <span className="font-mono font-bold text-[#20252B]">2%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Data Elements Tracked (12) */}
          <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#D8D5CD] pb-2">
              <h4 className="text-xs font-bold text-[#20252B] uppercase tracking-wider flex items-center gap-1.5">
                <span>Data Elements Tracked ({trackedElements.length})</span>
                <span title="Total normalized golden schema attributes" className="cursor-help">
                  <Info className="w-3 h-3 text-[#68717C]" />
                </span>
              </h4>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {trackedElements.map((el, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-[11px] text-[#20252B] font-medium"
                >
                  {el}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-[#D8D5CD]">
              <button
                type="button"
                className="text-xs text-[#2457A6] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View all data elements</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bottom Section: Lineage Events Table Card */}
      <div className="rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#D8D5CD] bg-[#FFFFFF] flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#20252B] uppercase tracking-wider">
              Lineage Events
            </h4>
            <p className="text-[11px] text-[#68717C]">
              Operational extraction and golden record update audit log
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEventsExpanded(!isEventsExpanded)}
            className="p-1 rounded text-[#68717C] hover:text-[#20252B] hover:bg-[#ECEAE4] cursor-pointer"
            title={isEventsExpanded ? 'Collapse events' : 'Expand events'}
          >
            {isEventsExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {isEventsExpanded && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D8D5CD] bg-[#ECEAE4] text-[#68717C] uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-4 font-bold">Date & Time</th>
                    <th className="py-2.5 px-4 font-bold">Event</th>
                    <th className="py-2.5 px-4 font-bold">Source System</th>
                    <th className="py-2.5 px-4 font-bold">Details</th>
                    <th className="py-2.5 px-4 font-bold text-right">Triggered By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D5CD] text-[#20252B]">
                  {lineageEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="py-2.5 px-4 font-mono text-[#68717C] whitespace-nowrap">
                        {evt.timestamp}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#20252B]">
                        {evt.event}
                      </td>
                      <td className="py-2.5 px-4 text-[#2457A6] font-medium">
                        {evt.source}
                      </td>
                      <td className="py-2.5 px-4 text-[#68717C]">
                        {evt.details}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-medium text-[#20252B]">
                        {evt.triggeredBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#ECEAE4]/40 border-t border-[#D8D5CD] flex items-center justify-between text-xs text-[#68717C]">
              <span>Showing 1 to {lineageEvents.length} of {lineageEvents.length} events</span>
              <a
                href="/audit"
                className="text-[#2457A6] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View full lineage history</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
