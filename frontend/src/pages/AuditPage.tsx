import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { auditApi } from '../api/auditApi';
import { SkeletonRow } from '../components/shared/SkeletonRow';
import { EmptyState } from '../components/shared/EmptyState';
import { ErrorState } from '../components/shared/ErrorState';
import { formatDateTime } from '../utils/format';
import clsx from 'clsx';

const actionColors: Record<string, string> = {
  LOGIN:                      'badge-green',
  LOGIN_FAILED:               'badge-amber',
  ACCOUNT_LOCKED:             'badge-red',
  LOGOUT:                     'badge-slate',
  CONFIG_UPDATE:              'badge-navy',
  OPP_RULES_UPDATE:           'badge-navy',
  MERGE_APPROVED:             'badge-teal',
  MERGE_REJECTED:             'badge-slate',
  MERGE_UPDATED:              'badge-teal',
  OPPORTUNITY_STATUS_CHANGE:  'badge-slate',
  OPPORTUNITY_DISMISSED:      'badge-slate',
  INGEST_RELOAD:              'badge-navy',
  REMATCH_ALL:                'badge-navy',
  OPPORTUNITIES_RECOMPUTE:    'badge-navy',
  UNAUTHORIZED_ACCESS_ATTEMPT:'badge-red',
  REVIEW_DECISION:            'badge-teal',
};

export function AuditPage() {
  const [page, setPage]         = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [actorFilter, setActorFilter]   = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['audit', page, actionFilter, actorFilter],
    queryFn: () => auditApi.getLogs({
      page,
      pageSize: 20,
      action:  actionFilter || undefined,
      actorId: actorFilter  || undefined,
    }),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="p-6">
      <div className="page-header flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">Immutable record of all security and business-critical actions</p>
        </div>
        {data && (
          <p className="text-xs text-slate-500 self-end">{data.totalElements.toLocaleString('en-IN')} events</p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="input w-44 text-xs"
          placeholder="Filter by action…"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value.toUpperCase()); setPage(0); }}
        />
        <input
          className="input w-52 text-xs"
          placeholder="Filter by actor (email)…"
          value={actorFilter}
          onChange={(e) => { setActorFilter(e.target.value); setPage(0); }}
        />
        {(actionFilter || actorFilter) && (
          <button
            className="btn-ghost text-xs"
            onClick={() => { setActionFilter(''); setActorFilter(''); setPage(0); }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Role</th>
                <th>Action</th>
                <th>Target</th>
                <th>Description</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRow cols={7} rows={10} />
              ) : error ? (
                <tr><td colSpan={7}><ErrorState error={error} onRetry={() => refetch()} /></td></tr>
              ) : !data || data.content.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={FileText} title="No audit events" description="No matching audit records found." />
                  </td>
                </tr>
              ) : (
                data.content.map((log) => (
                  <tr key={log.id}>
                    <td className="text-xs font-mono text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="text-xs text-slate-700 max-w-[12rem] truncate">{log.actorId}</td>
                    <td>
                      <span className="badge badge-slate capitalize">{log.actorRole}</span>
                    </td>
                    <td>
                      <span className={clsx('badge', actionColors[log.action] ?? 'badge-slate')}>
                        {log.action}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600">
                      {log.targetType && <span className="text-slate-400">{log.targetType}/</span>}
                      {log.targetId ?? '—'}
                    </td>
                    <td className="text-xs text-slate-600 max-w-xs truncate" title={log.description ?? ''}>
                      {log.description ?? '—'}
                    </td>
                    <td className="text-2xs font-mono text-slate-400">{log.ip ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              Page {data.pageNumber + 1} of {data.totalPages}
            </p>
            <div className="flex gap-1">
              <button className="btn-ghost py-1 px-2" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                <ChevronLeft size={13} />
              </button>
              <button className="btn-ghost py-1 px-2" onClick={() => setPage((p) => p + 1)} disabled={data.last}>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
