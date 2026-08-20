import { AlertCircle, RefreshCw, ShieldOff } from 'lucide-react';
import { AxiosError } from 'axios';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const axiosError = error instanceof AxiosError ? error : null;
  const status = axiosError?.response?.status;

  if (status === 403) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldOff size={24} className="text-slate-400 mb-3" />
        <p className="text-sm font-medium text-slate-700">Access Restricted</p>
        <p className="text-xs text-slate-400 mt-1">
          You don't have permission to view this resource.
        </p>
      </div>
    );
  }

  if (status === 404) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={24} className="text-slate-400 mb-3" />
        <p className="text-sm font-medium text-slate-700">Not Found</p>
        <p className="text-xs text-slate-400 mt-1">The requested resource could not be found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle size={24} className="text-red-400 mb-3" />
      <p className="text-sm font-medium text-slate-700">Something went wrong</p>
      <p className="text-xs text-slate-400 mt-1">
        {axiosError?.response?.data
          ? (axiosError.response.data as { message?: string }).message ?? 'An error occurred'
          : 'Unable to load data. Please try again.'}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4 text-xs">
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}
