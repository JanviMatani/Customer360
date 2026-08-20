import React, { useState } from 'react';
import { Search, ShieldAlert, Sliders, GitMerge, Sparkles, Key, FileText, CheckCircle2 } from 'lucide-react';
import { AuditLogEntry, UserRole } from '../../types';
import { formatDateTime } from '../../lib/utils';
import { useAuditLogs } from '../../hooks/useAudit';

export const AuditLogTable: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAuditLogs({ action: selectedAction, search });

  const logs = data?.logs || [];

  const getActionBadge = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'CONFIG':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EBF1FA] border border-[#BCD1F0] text-[#2457A6] font-mono text-[10px] font-bold">
            <Sliders className="w-3 h-3" />
            CONFIG
          </span>
        );
      case 'MERGE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EBF4EF] border border-[#A8D3BC] text-[#287A52] font-mono text-[10px] font-bold">
            <GitMerge className="w-3 h-3" />
            MERGE
          </span>
        );
      case 'OPP':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EBF1FA] border border-[#BCD1F0] text-[#2457A6] font-mono text-[10px] font-bold">
            <Sparkles className="w-3 h-3" />
            OPP
          </span>
        );
      case 'OVERRIDE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FBF4EB] border border-[#E8CEAB] text-[#A66A16] font-mono text-[10px] font-bold">
            <Sliders className="w-3 h-3" />
            OVERRIDE
          </span>
        );
      case 'UNAUTHORIZED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F9ECEC] border border-[#E8B8B8] text-[#B84242] font-mono text-[10px] font-bold">
            <ShieldAlert className="w-3 h-3" />
            SECURITY / 403
          </span>
        );
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-[#20252B] font-mono text-[10px] font-bold">
            <Key className="w-3 h-3" />
            LOGIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ECEAE4] text-[#68717C] font-mono text-[10px] border border-[#D8D5CD]">
            {action}
          </span>
        );
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="text-[#B84242] font-mono font-bold text-[10px]">[ADMIN]</span>;
      case 'manager':
        return <span className="text-[#2457A6] font-mono font-bold text-[10px]">[MGR]</span>;
      case 'rm':
        return <span className="text-[#287A52] font-mono font-bold text-[10px]">[RM]</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-lg border border-[#D8D5CD] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#68717C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by actor, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-xs text-[#20252B] placeholder-[#68717C] focus:border-[#2457A6] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'CONFIG', 'MERGE', 'OPP', 'OVERRIDE', 'UNAUTHORIZED', 'LOGIN'].map((act) => (
            <button
              key={act}
              onClick={() => setSelectedAction(act)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedAction === act
                  ? 'bg-[#2457A6] text-white shadow-xs'
                  : 'bg-[#ECEAE4] text-[#68717C] hover:text-[#20252B] border border-[#D8D5CD]'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D8D5CD] bg-[#ECEAE4] text-[#68717C] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 font-mono">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4 text-center">Category</th>
                <th className="py-3 px-4">Event Description</th>
                <th className="py-3 px-4 font-mono text-[#68717C]">Log ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D5CD] text-[#20252B]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#68717C]">
                    Loading audit trail stream...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#68717C]">
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className={`transition-colors ${
                      log.action === 'UNAUTHORIZED'
                        ? 'bg-[#F9ECEC]/50 hover:bg-[#F9ECEC]'
                        : 'hover:bg-[#F4F2ED]'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-[#68717C] whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getRoleBadge(log.actorRole)}
                        <span className="font-mono text-[#20252B] font-semibold">{log.actorEmail}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4 text-[#20252B] leading-relaxed font-sans">
                      {log.description}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#68717C] text-[11px] whitespace-nowrap">
                      {log.id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
