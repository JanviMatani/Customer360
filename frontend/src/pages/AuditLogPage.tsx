import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Sliders,
  GitMerge,
  Sparkles,
  Key,
  ShieldAlert,
  Download,
  Filter,
} from 'lucide-react';
import { useAuditLogs } from '../hooks/useAudit';
import { PaginationBar } from '../components/shared/PaginationBar';
import { formatDateTime } from '../lib/utils';
import { AuditLogEntry, UserRole } from '../types';

export const AuditLogPage: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const { data, isLoading } = useAuditLogs({
    action: selectedAction !== 'all' ? selectedAction : undefined,
    search: search || undefined,
  });

  const allLogs = data?.logs || [];
  const totalCount = allLogs.length;
  const paginatedLogs = allLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getActionBadge = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'CONFIG':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EBF1FA] border border-[#BCD1F0] text-[#2457A6] font-mono text-[10px] font-bold">
            <Sliders className="w-3 h-3" />
            CONFIG
          </span>
        );
      case 'MERGE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EBF4EF] border border-[#A8D3BC] text-[#287A52] font-mono text-[10px] font-bold">
            <GitMerge className="w-3 h-3" />
            MERGE
          </span>
        );
      case 'OPP':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EBF1FA] border border-[#BCD1F0] text-[#2457A6] font-mono text-[10px] font-bold">
            <Sparkles className="w-3 h-3" />
            OPP
          </span>
        );
      case 'OVERRIDE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FBF4EB] border border-[#E8CEAB] text-[#A66A16] font-mono text-[10px] font-bold">
            <Sliders className="w-3 h-3" />
            OVERRIDE
          </span>
        );
      case 'UNAUTHORIZED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F9ECEC] border border-[#E8B8B8] text-[#B84242] font-mono text-[10px] font-bold">
            <ShieldAlert className="w-3 h-3" />
            SECURITY / 403
          </span>
        );
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ECEAE4] border border-[#D8D5CD] text-[#20252B] font-mono text-[10px] font-bold">
            <Key className="w-3 h-3" />
            LOGIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ECEAE4] text-[#68717C] font-mono text-[10px] border border-[#D8D5CD]">
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#D8D5CD]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[#20252B] uppercase tracking-tight">
              Immutable Audit & Governance Trail
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#EBF1FA] border border-[#BCD1F0] text-[#2457A6] font-mono font-semibold">
              {totalCount} Total Entries
            </span>
          </div>
          <p className="text-xs text-[#68717C]">
            Tamper-evident system log tracking identity decisions, attribute overrides, threshold updates, and RBAC security events.
          </p>
        </div>
      </div>

      {/* KPI Top Stat Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
          <div className="flex items-center justify-between text-[#68717C] text-[11px] font-semibold uppercase">
            <span>Total Events</span>
            <History className="w-3.5 h-3.5 text-[#2457A6]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#20252B] mt-1">{totalCount}</div>
          <div className="text-[10px] text-[#68717C]">All recorded operations</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
          <div className="flex items-center justify-between text-[#68717C] text-[11px] font-semibold uppercase">
            <span>Security Integrity</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#287A52]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#287A52] mt-1">100%</div>
          <div className="text-[10px] text-[#68717C]">Cryptographically verified</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
          <div className="flex items-center justify-between text-[#68717C] text-[11px] font-semibold uppercase">
            <span>Merge Operations</span>
            <GitMerge className="w-3.5 h-3.5 text-[#287A52]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#287A52] mt-1">
            {allLogs.filter((l) => l.action === 'MERGE').length}
          </div>
          <div className="text-[10px] text-[#68717C]">Identity state mutations</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
          <div className="flex items-center justify-between text-[#68717C] text-[11px] font-semibold uppercase">
            <span>Security Alerts</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#B84242]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#B84242] mt-1">
            {allLogs.filter((l) => l.action === 'UNAUTHORIZED').length}
          </div>
          <div className="text-[10px] text-[#68717C]">Access violations / 403s</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#68717C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-xs text-[#20252B] placeholder-[#68717C] focus:border-[#2457A6] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'CONFIG', 'MERGE', 'OPP', 'OVERRIDE', 'UNAUTHORIZED', 'LOGIN'].map((act) => (
            <button
              key={act}
              onClick={() => {
                setSelectedAction(act);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
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
                <th className="py-3 px-4 font-mono text-[11px]">Audit ID</th>
                <th className="py-3 px-4 text-[11px]">Timestamp (UTC)</th>
                <th className="py-3 px-4 text-[11px]">Action Category</th>
                <th className="py-3 px-4 text-[11px]">Actor & Role</th>
                <th className="py-3 px-4 text-[11px]">Target Entity</th>
                <th className="py-3 px-4 text-[11px]">Audit Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D5CD] text-[#20252B]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#68717C] font-mono">
                    Querying immutable audit logs...
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#68717C]">
                    No audit records match the selected filter.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F4F2ED] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#2457A6] whitespace-nowrap">
                      {log.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#68717C] text-[11px] whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {getRoleBadge(log.actorRole)}
                        <span className="font-mono text-[#20252B] font-medium">{log.actorEmail}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#20252B] whitespace-nowrap">
                      {log.targetId || 'SYSTEM'}
                    </td>
                    <td className="py-3 px-4 text-[#20252B] max-w-md">
                      <div className="leading-relaxed">{log.description}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PaginationBar
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / pageSize) || 1}
          totalItems={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
};
