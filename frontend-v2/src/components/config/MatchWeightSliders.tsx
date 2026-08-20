import React, { useState } from 'react';
import { Sliders, Save, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { MatchConfig } from '../../types';
import { getConfidenceBadgeProps, formatDateTime } from '../../lib/utils';
import { useUpdateMatchConfig } from '../../hooks/useConfig';
import confetti from 'canvas-confetti';

interface MatchWeightSlidersProps {
  config: MatchConfig;
}

export const MatchWeightSliders: React.FC<MatchWeightSlidersProps> = ({ config }) => {
  const updateMutation = useUpdateMatchConfig();

  const [weights, setWeights] = useState(config.weights);
  const [autoMergeThreshold, setAutoMergeThreshold] = useState(config.autoMergeThreshold);
  const [manualReviewThreshold, setManualReviewThreshold] = useState(config.manualReviewThreshold);
  const [testScore, setTestScore] = useState(84);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalWeight = Object.values(weights).reduce((a: number, b: number) => a + b, 0);

  const handleWeightChange = (key: keyof MatchConfig['weights'], val: number) => {
    setWeights((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      weights,
      autoMergeThreshold,
      manualReviewThreshold,
    });
    setSavedSuccess(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Preview result for testScore
  const previewProps = getConfidenceBadgeProps(testScore, autoMergeThreshold, manualReviewThreshold);

  return (
    <div className="space-y-6">
      {/* Live Decision Preview Banner */}
      <div className="p-4 rounded-lg border border-[#BCD1F0] bg-[#EBF1FA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-[#2457A6] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2457A6]" />
            <span>Interactive Live Engine Threshold Simulator</span>
          </div>
          <div className="text-xs text-[#20252B]">
            Simulate how a sample candidate score (e.g. Rahul Sharma at <strong className="text-[#2457A6] font-mono">84%</strong>) is categorized with your threshold parameters:
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-[#FFFFFF] p-2.5 rounded-md border border-[#D8D5CD]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#68717C]">Test Score:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={testScore}
              onChange={(e) => setTestScore(Number(e.target.value))}
              className="w-16 p-1 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] font-mono text-center text-xs text-[#20252B] font-bold focus:border-[#2457A6] focus:outline-hidden"
            />
          </div>
          <span className="text-[#68717C]">→</span>
          <span className={`px-3 py-1 rounded-md text-xs font-bold font-mono border ${previewProps.bgClass}`}>
            {previewProps.label}
          </span>
        </div>
      </div>

      {/* Threshold Sliders Section */}
      <div className="p-5 rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] space-y-5 shadow-xs">
        <h4 className="text-sm font-bold text-[#20252B] uppercase tracking-wider pb-2 border-b border-[#D8D5CD] flex items-center justify-between">
          <span>Decision Threshold Boundaries</span>
          <span className="text-xs text-[#68717C] font-normal">Controls auto-merge vs compliance review routing</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auto-Merge Slider */}
          <div className="space-y-2 p-4 rounded-md bg-[#ECEAE4] border border-[#D8D5CD]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#20252B]">
                Auto-Merge Upper Threshold:
              </span>
              <span className="font-mono text-base font-extrabold text-[#287A52]">
                ≥ {autoMergeThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="70"
              max="99"
              value={autoMergeThreshold}
              onChange={(e) => setAutoMergeThreshold(Number(e.target.value))}
              className="w-full h-2 bg-[#D8D5CD] rounded-lg appearance-none cursor-pointer accent-[#287A52]"
            />
            <p className="text-[11px] text-[#68717C]">
              Matches with confidence &gt;= {autoMergeThreshold}% are seamlessly stitched without manual RM review.
            </p>
          </div>

          {/* Manual Review Slider */}
          <div className="space-y-2 p-4 rounded-md bg-[#ECEAE4] border border-[#D8D5CD]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#20252B]">
                Manual Review Lower Floor:
              </span>
              <span className="font-mono text-base font-extrabold text-[#A66A16]">
                ≥ {manualReviewThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="95"
              value={manualReviewThreshold}
              onChange={(e) => setManualReviewThreshold(Number(e.target.value))}
              className="w-full h-2 bg-[#D8D5CD] rounded-lg appearance-none cursor-pointer accent-[#A66A16]"
            />
            <p className="text-[11px] text-[#68717C]">
              Matches between {manualReviewThreshold}% and {autoMergeThreshold - 1}% enter the compliance review queue. Below {manualReviewThreshold}% are separated.
            </p>
          </div>
        </div>
      </div>

      {/* Attribute Weights Section */}
      <div className="p-5 rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#D8D5CD]">
          <h4 className="text-sm font-bold text-[#20252B] uppercase tracking-wider">
            Identifier Match Weights (Must sum to 100)
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#68717C]">Running Total:</span>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border ${
                totalWeight === 100
                  ? 'bg-[#EBF4EF] text-[#287A52] border-[#A8D3BC]'
                  : 'bg-[#F9ECEC] text-[#B84242] border-[#E8B8B8]'
              }`}
            >
              {totalWeight} / 100 Pts
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* PAN Weight */}
          <div className="p-3.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#20252B]">PAN-like Strong ID</span>
              <span className="font-mono font-bold text-[#2457A6]">{weights.pan} Pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              value={weights.pan}
              onChange={(e) => handleWeightChange('pan', Number(e.target.value))}
              className="w-full h-1.5 bg-[#D8D5CD] rounded-lg appearance-none cursor-pointer accent-[#2457A6]"
            />
            <span className="text-[10px] text-[#68717C]">Exact 10-char legal identity identifier</span>
          </div>

          {/* Mobile Weight */}
          <div className="p-3.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#20252B]">Mobile Number</span>
              <span className="font-mono font-bold text-[#2457A6]">{weights.mobile} Pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.mobile}
              onChange={(e) => handleWeightChange('mobile', Number(e.target.value))}
              className="w-full h-1.5 bg-[#D8D5CD] rounded-lg appearance-none cursor-pointer accent-[#2457A6]"
            />
            <span className="text-[10px] text-[#68717C]">Standardized 10-digit telecom contact</span>
          </div>

          {/* Email Weight */}
          <div className="p-3.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#20252B]">Email Address</span>
              <span className="font-mono font-bold text-[#2457A6]">{weights.email} Pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={weights.email}
              onChange={(e) => handleWeightChange('email', Number(e.target.value))}
              className="w-full h-1.5 bg-[#D8D5CD] rounded-lg appearance-none cursor-pointer accent-[#2457A6]"
            />
            <span className="text-[10px] text-[#68717C]">Normalized email identifier</span>
          </div>

          {/* DOB Weight */}
          <div className="p-3.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#20252B]">Date of Birth (DOB)</span>
              <span className="font-mono font-bold text-[#2457A6]">{weights.dob} Pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={weights.dob}
              onChange={(e) => handleWeightChange('dob', Number(e.target.value))}
              className="w-full h-1.5 bg-[#D8D5CD] rounded-lg appearance-none cursor-pointer accent-[#2457A6]"
            />
            <span className="text-[10px] text-[#68717C]">ISO standard date alignment</span>
          </div>

          {/* Name Weight */}
          <div className="p-3.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#20252B]">Customer Name (Fuzzy)</span>
              <span className="font-mono font-bold text-[#2457A6]">{weights.name} Pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={weights.name}
              onChange={(e) => handleWeightChange('name', Number(e.target.value))}
              className="w-full h-1.5 bg-[#D8D5CD] rounded-lg appearance-none cursor-pointer accent-[#2457A6]"
            />
            <span className="text-[10px] text-[#68717C]">Jaro-Winkler string similarity weight</span>
          </div>

          {/* City Weight */}
          <div className="p-3.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#20252B]">City / Jurisdiction</span>
              <span className="font-mono font-bold text-[#2457A6]">{weights.city} Pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={weights.city}
              onChange={(e) => handleWeightChange('city', Number(e.target.value))}
              className="w-full h-1.5 bg-[#D8D5CD] rounded-lg appearance-none cursor-pointer accent-[#2457A6]"
            />
            <span className="text-[10px] text-[#68717C]">Standardized geographic location</span>
          </div>
        </div>
      </div>

      {/* Save Button & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs">
        <div className="text-xs text-[#68717C]">
          Last updated by <strong className="text-[#20252B]">{config.updatedBy}</strong> on{' '}
          {formatDateTime(config.lastUpdated)}
        </div>

        <button
          id="save-match-config-btn"
          onClick={handleSave}
          disabled={updateMutation.isPending || totalWeight !== 100}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-[#2457A6] hover:bg-[#183B70] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          {updateMutation.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving & Recalculating...</span>
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-white" />
              <span>Config Saved & Stitched!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Apply Match Configuration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
