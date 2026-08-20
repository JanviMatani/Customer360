import React from 'react';
import {
  ArrowRight,
  Layers,
  Sparkles,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Binary,
  Cpu,
} from 'lucide-react';

interface FunnelData {
  ingested?: number;
  normalized?: number;
  candidates?: number;
  deterministicMatches?: number;
  fuzzyMatches?: number;
  autoMerged?: number;
  manualReview?: number;
  separated?: number;
}

interface PipelineFunnelProps {
  data?: FunnelData;
}

export const PipelineFunnel: React.FC<PipelineFunnelProps> = ({ data }) => {
  const counts = {
    ingested: data?.ingested ?? 1240,
    normalized: data?.normalized ?? 1240,
    candidates: data?.candidates ?? 340,
    deterministic: data?.deterministicMatches ?? 210,
    fuzzy: data?.fuzzyMatches ?? 130,
    scored: (data?.deterministicMatches ?? 210) + (data?.fuzzyMatches ?? 130),
    autoMerged: data?.autoMerged ?? 91,
    manualReview: data?.manualReview ?? 47,
    separated: data?.separated ?? 2,
  };

  const linearStages = [
    {
      id: 'ingested',
      label: '1. Ingested',
      count: counts.ingested,
      sub: '5 Disconnected Silos',
      icon: Layers,
      color: 'border-[#BCD1F0] bg-[#EBF1FA] text-[#2457A6]',
    },
    {
      id: 'normalized',
      label: '2. Normalized',
      count: counts.normalized,
      sub: 'Standardized PII & PAN',
      icon: Binary,
      color: 'border-[#D8D5CD] bg-[#FFFFFF] text-[#20252B]',
    },
    {
      id: 'candidates',
      label: '3. Candidates',
      count: counts.candidates,
      sub: 'Blocking Index Match',
      icon: Cpu,
      color: 'border-[#D8D5CD] bg-[#FFFFFF] text-[#20252B]',
    },
    {
      id: 'deterministic',
      label: '4. Deterministic',
      count: counts.deterministic,
      sub: 'Exact PAN / Mobile',
      icon: ShieldCheck,
      color: 'border-[#BCD1F0] bg-[#EBF1FA] text-[#2457A6]',
    },
    {
      id: 'fuzzy',
      label: '5. Fuzzy Match',
      count: counts.fuzzy,
      sub: 'Jaro-Winkler & Levenshtein',
      icon: GitBranch,
      color: 'border-[#D6C7F0] bg-[#F2EDFA] text-[#6A3BB8]',
    },
    {
      id: 'scored',
      label: '6. Scored',
      count: counts.scored,
      sub: 'Weighted Evidence (0-100%)',
      icon: Sparkles,
      color: 'border-[#D8D5CD] bg-[#FFFFFF] text-[#20252B]',
    },
  ];

  return (
    <div className="p-5 rounded-lg bg-[#FFFFFF] border border-[#D8D5CD] shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D8D5CD]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-[#20252B] uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#2457A6]" />
              <span>Identity Resolution Architecture & Processing Funnel</span>
            </h3>
            <span className="px-2 py-0.5 rounded-sm bg-[#EBF1FA] border border-[#BCD1F0] text-[10px] font-mono font-bold text-[#2457A6]">
              Real-Time Pipeline
            </span>
          </div>
          <p className="text-[11px] text-[#68717C] mt-0.5">
            End-to-end deterministic & probabilistic identity unification workflow from silo ingestion to decision outcome.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#68717C] font-mono">
          <span>Match Precision: <strong className="text-[#287A52]">99.8%</strong></span>
          <span>•</span>
          <span>Throughput: <strong className="text-[#20252B]">1,240 rec/s</strong></span>
        </div>
      </div>

      {/* Funnel Flow Stage Strip */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[860px] flex items-center justify-between gap-1.5">
          {/* First 6 Linear Pipeline Nodes */}
          {linearStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <React.Fragment key={stage.id}>
                <div
                  className={`flex-1 p-2.5 rounded-md border ${stage.color} flex flex-col justify-between min-h-[82px] shadow-2xs hover:shadow-xs transition-shadow`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                      {stage.label}
                    </span>
                    <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  </div>

                  <div className="font-mono text-lg font-bold text-[#20252B] my-0.5">
                    {stage.count.toLocaleString()}
                  </div>

                  <div className="text-[9px] text-[#68717C] truncate font-medium">
                    {stage.sub}
                  </div>
                </div>

                <div className="text-[#D8D5CD] shrink-0 px-0.5">
                  <ArrowRight className="w-4 h-4 text-[#68717C]/70" />
                </div>
              </React.Fragment>
            );
          })}

          {/* Stage 7: Decision Outcomes Branching Node */}
          <div className="flex-1.5 p-2 rounded-md border border-[#D8D5CD] bg-[#ECEAE4] flex flex-col justify-between min-h-[82px] shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#20252B] mb-1 flex items-center justify-between">
              <span>7. Decision Outcomes</span>
              <span className="text-[9px] font-mono text-[#68717C]">Automated & Triaged</span>
            </div>

            <div className="grid grid-cols-3 gap-1 text-center">
              {/* Auto-Merged */}
              <div className="p-1 rounded bg-[#EBF4EF] border border-[#A8D3BC] text-[#287A52]">
                <div className="flex items-center justify-center gap-0.5 text-[9px] font-bold uppercase">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>≥85%</span>
                </div>
                <div className="font-mono text-xs font-bold mt-0.5">
                  {counts.autoMerged}
                </div>
                <div className="text-[8px] opacity-90 truncate">Auto-Merge</div>
              </div>

              {/* Manual Review */}
              <div className="p-1 rounded bg-[#FBF4EB] border border-[#E8CEAB] text-[#A66A16]">
                <div className="flex items-center justify-center gap-0.5 text-[9px] font-bold uppercase">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>60-84%</span>
                </div>
                <div className="font-mono text-xs font-bold mt-0.5">
                  {counts.manualReview}
                </div>
                <div className="text-[8px] opacity-90 truncate">Review</div>
              </div>

              {/* Separated */}
              <div className="p-1 rounded bg-[#F9ECEC] border border-[#E8B8B8] text-[#B84242]">
                <div className="flex items-center justify-center gap-0.5 text-[9px] font-bold uppercase">
                  <XCircle className="w-2.5 h-2.5" />
                  <span>&lt;60%</span>
                </div>
                <div className="font-mono text-xs font-bold mt-0.5">
                  {counts.separated}
                </div>
                <div className="text-[8px] opacity-90 truncate">Separate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
