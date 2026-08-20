import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Edit3, ShieldAlert, ArrowRight } from 'lucide-react';
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
      <div className="p-4 rounded-lg border border-[#A8D3BC] bg-[#EBF4EF] text-[#287A52] flex items-center gap-3 text-xs font-medium">
        <CheckCircle className="w-4 h-4 text-[#287A52] shrink-0" />
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
          className="p-5 rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] shadow-xs relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#D8D5CD]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-[#FBF4EB] text-[#A66A16]">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#20252B] uppercase tracking-wide">
                  {conflict.field} Conflict Detected
                </h4>
                <div className="text-[11px] text-[#68717C]">
                  Multiple source systems maintain divergent values for this field
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {conflict.flaggedForReview && (
                <span className="px-2 py-0.5 rounded bg-[#FBF4EB] text-[#A66A16] border border-[#E8CEAB] text-[10px] font-bold uppercase tracking-wider">
                  Flagged for Review
                </span>
              )}
              {user?.role === 'admin' && (
                <button
                  id={`override-conflict-${idx}-btn`}
                  onClick={() => openOverrideModal(conflict)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#EBF1FA] hover:bg-[#D9E6F7] border border-[#BCD1F0] text-[#2457A6] text-xs font-semibold transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Override Value</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Selected Value with Precedence */}
            <div className="p-3.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#68717C] font-semibold">Selected Golden Value:</span>
                <SourceBadge source={conflict.selectedSource} showFullName size="sm" />
              </div>
              <div className="font-mono text-sm font-bold text-[#287A52] bg-[#FFFFFF] px-3 py-2 rounded-md border border-[#D8D5CD] break-all">
                {conflict.selectedValue}
              </div>
              {conflict.precedenceBadge && (
                <div className="text-[10px] text-[#68717C] flex items-center gap-1">
                  <span className="text-[#2457A6] font-semibold">Rule Precedence:</span>
                  <span>{conflict.precedenceBadge}</span>
                </div>
              )}
              {conflict.overrideReason && (
                <div className="text-[10px] text-[#A66A16] italic bg-[#FBF4EB] border border-[#E8CEAB] p-1.5 rounded-md">
                  {conflict.overrideReason}
                </div>
              )}
            </div>

            {/* Conflicting Source Values */}
            <div className="p-3.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] space-y-2">
              <span className="text-[#68717C] font-semibold">Conflicting Silo Records:</span>
              <div className="space-y-1.5">
                {conflict.conflictingValues.map((item, cIdx) => (
                  <div
                    key={cIdx}
                    className="flex items-center justify-between p-2 rounded-md bg-[#FFFFFF] border border-[#D8D5CD]"
                  >
                    <span className="font-mono text-[#20252B] break-all">{item.value}</span>
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
        <div className="fixed inset-0 bg-[#20252B]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[#FFFFFF] border border-[#D8D5CD] rounded-lg p-6 max-w-lg w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8D5CD] pb-3">
              <h3 className="text-base font-bold text-[#20252B] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#2457A6]" />
                <span>Admin Override: {selectedConflict.field}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#68717C] hover:text-[#20252B] text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#20252B] font-semibold mb-1">
                  Selected Override Value:
                </label>
                <input
                  type="text"
                  required
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  className="w-full p-2.5 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-[#20252B] font-mono text-xs focus:border-[#2457A6] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#20252B] font-semibold mb-1">
                  Authoritative Source System:
                </label>
                <select
                  value={overrideSource}
                  onChange={(e) => setOverrideSource(e.target.value as SourceSystem)}
                  className="w-full p-2.5 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-[#20252B] text-xs focus:border-[#2457A6] focus:outline-hidden"
                >
                  <option value="equity">Equity (Verified Brokerage KYC)</option>
                  <option value="mf">Mutual Funds (CAMS/KFintech Registry)</option>
                  <option value="insurance">Insurance (Policy Contract Document)</option>
                  <option value="loans">Loans (Underwriting Bureau File)</option>
                  <option value="wealth">Wealth (Signed Advisory Mandate)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#20252B] font-semibold mb-1">
                  Justification / Audit Trail Note:
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why this value takes precedence over other silos..."
                  className="w-full p-2.5 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-[#20252B] text-xs focus:border-[#2457A6] focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-[11px] text-[#68717C]">
                <span className="font-semibold text-[#2457A6]">Compliance Warning:</span> This override will write an immutable record to the enterprise audit log with actor ID ({user?.email}) and timestamp.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md bg-[#ECEAE4] hover:bg-[#D8D5CD] text-[#20252B] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={overrideMutation.isPending}
                  className="px-4 py-2 rounded-md bg-[#2457A6] hover:bg-[#183B70] text-white text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {overrideMutation.isPending ? 'Applying...' : 'Confirm & Save Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
