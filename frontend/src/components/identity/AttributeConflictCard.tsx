import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Edit3, ShieldAlert } from 'lucide-react';
import { AttributeConflict, SourceSystem } from '../../types';
import { SourceBadge } from '../shared/SourceBadge';
import { useAuthStore } from '../../store/authStore';
import { useOverrideConflict } from '../../hooks/useCustomers';

interface AttributeConflictCardProps {
  goldenId: string;
  conflicts: AttributeConflict[];
}

export const AttributeConflictCard: React.FC<AttributeConflictCardProps> = ({ goldenId, conflicts }) => {
  const { user } = useAuthStore();
  const overrideMutation = useOverrideConflict();
  const [selectedConflict, setSelectedConflict] = useState<AttributeConflict | null>(null);
  const [overrideValue, setOverrideValue] = useState('');
  const [overrideSource, setOverrideSource] = useState<SourceSystem>('equity');
  const [overrideReason, setOverrideReason] = useState('');
  const [showModal, setShowModal] = useState(false);

  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-3 text-xs font-semibold">
        <CheckCircle size={16} className="text-emerald-700 shrink-0" />
        <span>No active attribute conflicts detected across linked source systems. Provenance is cleanly harmonized.</span>
      </div>
    );
  }

  const openOverrideModal = (conflict: AttributeConflict) => {
    setSelectedConflict(conflict);
    setOverrideValue(conflict.selectedValue);
    setOverrideSource(conflict.selectedSource);
    setOverrideReason('Verified with customer during KYC update');
    setShowModal(true);
  };

  const handleApplyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConflict) return;

    await overrideMutation.mutateAsync({
      goldenId,
      field: selectedConflict.field,
      selectedValue: overrideValue,
      selectedSource: overrideSource,
      reason: overrideReason,
    });

    setShowModal(false);
    setSelectedConflict(null);
  };

  return (
    <div className="space-y-3">
      {conflicts.map((conflict, idx) => (
        <div
          key={idx}
          id={`conflict-card-${idx}`}
          className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-amber-50 text-amber-800">
                <AlertCircle size={14} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  {conflict.field} Value Divergence
                </h4>
                <div className="text-[10px] text-gray-500">
                  Divergent values maintained across linked sources
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {conflict.flaggedForReview && (
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold uppercase tracking-wider">
                  Flagged for Review
                </span>
              )}
              {user?.role === 'admin' && (
                <button
                  id={`override-conflict-${idx}-btn`}
                  onClick={() => openOverrideModal(conflict)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-[#1B4FD8] hover:text-white border border-[#BCD1F0] text-[#1B4FD8] text-2xs font-bold transition-all cursor-pointer"
                >
                  <Edit3 size={11} />
                  <span>Override Value</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Selected Value with Precedence */}
            <div className="p-3 rounded-md bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Active Golden Record Value:</span>
                <SourceBadge source={conflict.selectedSource} showFullName size="sm" />
              </div>
              <div className="font-mono text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded border border-gray-200 break-all">
                {conflict.selectedValue}
              </div>
              {conflict.precedenceBadge && (
                <div className="text-[9px] text-gray-500 flex items-center gap-1 font-medium">
                  <span className="text-[#1B4FD8] font-bold">Rule Precedence:</span>
                  <span>{conflict.precedenceBadge}</span>
                </div>
              )}
              {conflict.overrideReason && (
                <div className="text-[9px] text-amber-800 italic bg-amber-50 border border-amber-200 p-1.5 rounded">
                  {conflict.overrideReason}
                </div>
              )}
            </div>

            {/* Conflicting Source Values */}
            <div className="p-3 rounded-md bg-gray-50 border border-gray-200 space-y-2">
              <span className="text-gray-500 font-semibold">Conflicting Silo Records:</span>
              <div className="space-y-1.5">
                {conflict.conflictingValues.map((item, cIdx) => (
                  <div
                    key={cIdx}
                    className="flex items-center justify-between p-2 rounded bg-white border border-gray-200"
                  >
                    <span className="font-mono text-gray-800 break-all text-xs font-medium">{item.value}</span>
                    <SourceBadge source={item.source} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Override Modal */}
      {showModal && selectedConflict && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-lg p-5 max-w-lg w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert size={18} className="text-[#1B4FD8]" />
                <span>Admin Override: {selectedConflict.field}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Selected Override Value:
                </label>
                <input
                  type="text"
                  required
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-50 focus:bg-white focus:border-[#1B4FD8] focus:ring-1 focus:ring-[#1B4FD8] focus:outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Authoritative Source System:
                </label>
                <select
                  value={overrideSource}
                  onChange={(e) => setOverrideSource(e.target.value as SourceSystem)}
                  className="w-full px-2 py-2 rounded border border-gray-300 bg-gray-50 focus:bg-white focus:border-[#1B4FD8] focus:outline-none transition-all"
                >
                  <option value="equity">Equity (Verified Brokerage KYC)</option>
                  <option value="mf">Mutual Funds (CAMS/KFintech Registry)</option>
                  <option value="insurance">Insurance (Policy Contract Document)</option>
                  <option value="loans">Loans (Underwriting Bureau File)</option>
                  <option value="wealth">Wealth (Signed Advisory Mandate)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Justification / Audit Trail Note:
                </label>
                <textarea
                  required
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why this value takes precedence over other silos..."
                  className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-50 focus:bg-white focus:border-[#1B4FD8] focus:ring-1 focus:ring-[#1B4FD8] focus:outline-none transition-all"
                />
              </div>

              <div className="p-2.5 rounded bg-gray-50 border border-gray-200 text-[10px] text-gray-500 font-medium">
                <span className="font-bold text-[#1B4FD8]">Compliance Warning:</span> This override will write an immutable record to the enterprise audit log with actor ID ({user?.email}) and timestamp.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={overrideMutation.isPending}
                  className="px-3 py-1.5 rounded bg-[#1B4FD8] hover:bg-[#113CAD] text-white font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {overrideMutation.isPending ? 'Applying...' : 'Confirm Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
