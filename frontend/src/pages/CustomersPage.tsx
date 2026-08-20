import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { customerApi } from '../api/customerApi';
import { ConfidenceBadge } from '../components/shared/ConfidenceBadge';
import { SourceBadge } from '../components/shared/SourceBadge';
import { SkeletonRow } from '../components/shared/SkeletonRow';
import { EmptyState } from '../components/shared/EmptyState';
import { ErrorState } from '../components/shared/ErrorState';
import { Users } from 'lucide-react';
import { formatINR } from '../utils/format';

export function CustomersPage() {
  const navigate = useNavigate();
  const [page, setPage]           = useState(0);
  const [city, setCity]           = useState('');
  const [cityInput, setCityInput] = useState('');
  const [nameSearch, setNameSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customers', page, city],
    queryFn: () => customerApi.list({ page, pageSize: 15, city: city || undefined }),
    placeholderData: (prev) => prev,
  });

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCity(cityInput.trim());
    setPage(0);
  };

  const allCustomers = data?.content ?? [];

  // Client-side filter by name or golden ID
  const customers = nameSearch.trim()
    ? allCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(nameSearch.toLowerCase()) ||
          c.id.toLowerCase().includes(nameSearch.toLowerCase())
      )
    : allCustomers;

  return (
    <div className="p-5">
      <div className="page-header flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">
            Unified customer identities resolved across Equity · MF · Insurance · Loans · Wealth
          </p>
        </div>
        {data && (
          <p className="text-xs text-slate-500 self-end">
            {data.totalElements.toLocaleString('en-IN')} unified customers
          </p>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Name / Golden ID search (client-side) */}
        <div className="relative max-w-xs w-full">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-8"
            placeholder="Search by name or Golden ID…"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            aria-label="Search by name or Golden ID"
          />
        </div>

        {/* City filter (API-side) */}
        <form onSubmit={handleCitySearch} className="flex gap-2">
          <div className="relative max-w-xs w-full">
            <input
              className="input"
              placeholder="Filter by city…"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              aria-label="Filter by city"
            />
          </div>
          <button type="submit" className="btn-secondary text-xs">Apply</button>
          {city && (
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => { setCity(''); setCityInput(''); setPage(0); }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Golden ID</th>
                <th>Source Systems</th>
                <th>Relationship Value</th>
                <th>Match Confidence</th>
                <th>Segment</th>
                <th>Conflicts</th>
                <th>RM</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRow cols={9} rows={10} />
              ) : error ? (
                <tr><td colSpan={9} className="py-0">
                  <ErrorState error={error} onRetry={() => refetch()} />
                </td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={9} className="py-0">
                  <EmptyState
                    icon={Users}
                    title="No customers found"
                    description={
                      nameSearch
                        ? `No customers matching "${nameSearch}".`
                        : city
                        ? `No customers in "${city}".`
                        : 'Run the matching pipeline from Configuration.'
                    }
                  />
                </td></tr>
              ) : customers.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/customers/${c.id}`)}
                >
                  <td>
                    <div>
                      <p className="font-medium text-slate-900">{c.name}</p>
                      {c.primaryEmail && (
                        <p className="text-2xs text-slate-400">{c.primaryEmail}</p>
                      )}
                    </div>
                  </td>
                  <td><span className="font-mono text-xs text-slate-600">{c.id}</span></td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(c.linkedSources ?? []).map((s) => (
                        <SourceBadge key={s} system={s} />
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="font-semibold text-slate-800">
                      {formatINR(c.totalRelationshipValue)}
                    </span>
                  </td>
                  <td>
                    {c.matchConfidence > 0 ? (
                      <ConfidenceBadge score={c.matchConfidence} showBar />
                    ) : (
                      <span className="text-xs text-slate-400">Single source</span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-slate capitalize">
                      {c.segment ?? '—'}
                    </span>
                  </td>
                  <td>
                    {(c.attributeConflicts ?? []).length > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-amber-700">
                        <AlertTriangle size={11} />
                        {c.attributeConflicts!.length} conflict{c.attributeConflicts!.length > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td><span className="text-xs text-slate-600">{c.rmId ?? '—'}</span></td>
                  <td>
                    <ArrowUpRight size={13} className="text-slate-400 hover:text-teal-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              Page {data.pageNumber + 1} of {data.totalPages} · {data.totalElements.toLocaleString('en-IN')} results
            </p>
            <div className="flex gap-1">
              <button
                className="btn-ghost py-1 px-2"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft size={13} />
              </button>
              <button
                className="btn-ghost py-1 px-2"
                onClick={() => setPage((p) => p + 1)}
                disabled={data.last}
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
