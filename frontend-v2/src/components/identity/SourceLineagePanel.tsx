import React, { useState } from 'react';
import {
  Database,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Users,
  BarChart3,
  Megaphone,
  Info,
} from 'lucide-react';
import { SourceRecord } from '../../types';
import { SourceBadge } from '../shared/SourceBadge';
import { formatCurrency } from '../../lib/utils';
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
  const [isFlowExpanded, setIsFlowExpanded] = useState(true);
  const [isTransformationsExpanded, setIsTransformationsExpanded] = useState(true);
  const [isEventsExpanded, setIsEventsExpanded] = useState(true);

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
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Split Lineage Info & Pipeline */}
      <div className="grid grid-cols-12 gap-4 items-start">
        {/* Left Side: Pipeline Flow */}
        <div className="col-span-8 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white shadow-2xs overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Core Ingestion Lineage Map</span>
                  <Info size={12} className="text-gray-400" />
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFlowExpanded(!isFlowExpanded)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
              >
                {isFlowExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {isFlowExpanded && (
              <div className="p-4 bg-white border-b border-gray-150 overflow-x-auto">
                <div className="min-w-[680px] grid grid-cols-4 gap-4 items-center">
                  {/* Sources */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                      Source Systems
                    </div>
                    {/* EQ */}
                    <div className="p-2.5 rounded border border-gray-200 bg-gray-50 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-gray-800">
                        <span className="w-5 h-5 rounded bg-blue-50 text-[#1B4FD8] font-mono text-[10px] font-bold flex items-center justify-center border border-blue-200">
                          EQ
                        </span>
                        <span>Equity Core Banking</span>
                      </div>
                    </div>
                    {/* MF */}
                    <div className="p-2.5 rounded border border-gray-200 bg-gray-50 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-gray-800">
                        <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold flex items-center justify-center border border-indigo-200">
                          MF
                        </span>
                        <span>Mutual Fund System</span>
                      </div>
                    </div>
                    {/* LN */}
                    <div className="p-2.5 rounded border border-gray-200 bg-gray-50 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-gray-800">
                        <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold flex items-center justify-center border border-emerald-200">
                          LN
                        </span>
                        <span>Loan & Insurance</span>
                      </div>
                    </div>
                  </div>

                  {/* Staging */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                      Staging Registry
                    </div>
                    <div className="p-2.5 rounded border border-gray-200 bg-gray-50 text-xs flex items-center justify-between">
                      <span className="font-semibold text-gray-700">EQ Staging</span>
                      <CheckCircle2 size={13} className="text-emerald-600" />
                    </div>
                    <div className="p-2.5 rounded border border-gray-200 bg-gray-50 text-xs flex items-center justify-between">
                      <span className="font-semibold text-gray-700">MF Staging</span>
                      <CheckCircle2 size={13} className="text-emerald-600" />
                    </div>
                    <div className="p-2.5 rounded border border-gray-200 bg-gray-50 text-xs flex items-center justify-between">
                      <span className="font-semibold text-gray-700">LN Staging</span>
                      <CheckCircle2 size={13} className="text-emerald-600" />
                    </div>
                  </div>

                  {/* Golden record consolidation */}
                  <div className="text-center space-y-2">
                    <div className="text-[10px] font-bold text-[#1B4FD8] uppercase tracking-wider">
                      Consolidation
                    </div>
                    <div className="p-3 rounded-lg border-2 border-[#1B4FD8] bg-white shadow-2xs space-y-1">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1B4FD8] border border-blue-200 flex items-center justify-center font-bold text-xs mx-auto">
                        <Users size={14} />
                      </div>
                      <div className="text-[9px] uppercase font-bold text-gray-400">Golden Profile</div>
                      <div className="font-mono font-bold text-xs text-gray-950">{goldenId}</div>
                    </div>
                  </div>

                  {/* Sync */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                      Downstream Sync
                    </div>
                    <div className="p-2.5 rounded border border-gray-200 bg-gray-50 text-xs">
                      <div className="font-bold text-gray-800 flex items-center gap-1.5">
                        <Users size={12} className="text-[#1B4FD8]" />
                        <span>CRM Portal</span>
                      </div>
                      <div className="text-[9px] text-emerald-700 font-bold mt-0.5">● Synced Real-time</div>
                    </div>
                    <div className="p-2.5 rounded border border-gray-200 bg-gray-50 text-xs">
                      <div className="font-bold text-gray-800 flex items-center gap-1.5">
                        <BarChart3 size={12} className="text-indigo-700" />
                        <span>Analytics BI</span>
                      </div>
                      <div className="text-[9px] text-emerald-700 font-bold mt-0.5">● Synced Real-time</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Data Quality and Details */}
        <div className="col-span-4 space-y-4">
          {/* Metadata details */}
          <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-2xs space-y-2.5">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-150 pb-1.5">
              Consolidation Telemetry
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Golden Identifier:</span>
                <span className="font-mono font-bold text-[#1B4FD8]">{goldenId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Record Created:</span>
                <span className="font-mono text-gray-800">{createdOn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Last Consolidated:</span>
                <span className="font-mono text-gray-800">{lastUpdated}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Overall Quality Match:</span>
                <span className="font-mono font-bold text-emerald-700">{overallQuality}%</span>
              </div>
            </div>
          </div>

          {/* Schema Mapped */}
          <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-2xs space-y-2">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-150 pb-1.5">
              Mapped Schema Attributes
            </h4>
            <div className="flex flex-wrap gap-1">
              {trackedElements.map((el, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-gray-50 border border-gray-200 text-[10px] font-semibold text-gray-700"
                >
                  {el}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Field Normalizations Panel */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <Database size={14} className="text-[#1B4FD8]" />
            <span>Operational Silo Mappings ({sourceLineage.length} Mapped Silos)</span>
          </h4>
          <button
            type="button"
            onClick={() => setIsTransformationsExpanded(!isTransformationsExpanded)}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            {isTransformationsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {isTransformationsExpanded && (
          <div className="p-4 bg-white border-b border-gray-150">
            <div className="grid grid-cols-3 gap-4">
              {sourceLineage.map((record, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-gray-200 bg-gray-50 space-y-2.5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                    <SourceBadge source={record.system} showFullName size="sm" />
                    <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-900">
                      ID: {record.sourceCustomerId}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-2xs">
                    {/* Name */}
                    <div className="p-1.5 rounded bg-white border border-gray-200">
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Name (Raw → Clean):</span>
                      <div className="flex items-center gap-1 font-mono text-gray-900 mt-0.5">
                        <span className="text-red-700 truncate max-w-[100px]">{record.rawName}</span>
                        <ArrowRight size={10} className="text-gray-400 shrink-0" />
                        <span className="text-emerald-700 font-bold truncate">{record.normalizedName}</span>
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="p-1.5 rounded bg-white border border-gray-200">
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Mobile (Raw → Clean):</span>
                      <div className="flex items-center gap-1 font-mono text-gray-900 mt-0.5">
                        <span className="text-gray-500">{record.rawMobile}</span>
                        <ArrowRight size={10} className="text-gray-400 shrink-0" />
                        <MaskedField value={record.normalizedMobile} type="mobile" />
                      </div>
                    </div>

                    {/* PAN */}
                    {record.rawPan && (
                      <div className="p-1.5 rounded bg-white border border-gray-200">
                        <span className="text-gray-400 block text-[9px] uppercase font-bold">PAN Verification:</span>
                        <div className="font-mono text-gray-900 mt-0.5">
                          <MaskedField value={record.rawPan} type="pan" />
                        </div>
                      </div>
                    )}

                    {/* DOB */}
                    {record.rawDob && (
                      <div className="p-1.5 rounded bg-white border border-gray-200">
                        <span className="text-gray-400 block text-[9px] uppercase font-bold">DOB Standardized:</span>
                        <div className="flex items-center gap-1 font-mono text-gray-900 mt-0.5">
                          <span className="text-gray-500">{record.rawDob}</span>
                          <ArrowRight size={10} className="text-gray-400 shrink-0" />
                          <span className="text-[#1B4FD8] font-bold">{record.normalizedDob}</span>
                        </div>
                      </div>
                    )}

                    {/* Balance */}
                    <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-gray-800">
                      <span>Holding Balance:</span>
                      <span className="font-mono text-emerald-800">
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

      {/* Events log */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Consolidation Audit log
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setIsEventsExpanded(!isEventsExpanded)}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            {isEventsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {isEventsExpanded && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase tracking-wider font-bold">
                  <th className="py-2 px-4">Timestamp</th>
                  <th className="py-2 px-4">Consolidation event</th>
                  <th className="py-2 px-4">Silo Source</th>
                  <th className="py-2 px-4">Extraction Details</th>
                  <th className="py-2 px-4 text-right">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {lineageEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 font-mono text-gray-500">{evt.timestamp}</td>
                    <td className="py-2 px-4 font-bold text-gray-900">{evt.event}</td>
                    <td className="py-2 px-4 text-[#1B4FD8] font-semibold">{evt.source}</td>
                    <td className="py-2 px-4 text-gray-500">{evt.details}</td>
                    <td className="py-2 px-4 text-right font-mono font-medium text-gray-800">{evt.triggeredBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
