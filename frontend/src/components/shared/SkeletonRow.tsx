interface SkeletonRowProps {
  cols?: number;
  rows?: number;
}

export function SkeletonRow({ cols = 6, rows = 5 }: SkeletonRowProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-3 py-2.5 border-b border-slate-100">
              <div className="skeleton h-4 rounded" style={{ width: `${60 + (c * 10) % 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card p-4 space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 rounded ${i === 0 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonText({ width = 'w-32' }: { width?: string }) {
  return <div className={`skeleton h-4 rounded ${width}`} />;
}
