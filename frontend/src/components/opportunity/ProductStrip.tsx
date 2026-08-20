import React from 'react';
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { OpportunityProduct, ProductHolding, SourceSystem } from '../../types';
import { formatCurrency, formatFullINR, getSourceDetails } from '../../lib/utils';

interface ProductStripProps {
  holdings: ProductHolding[];
  totalRelationshipValue: number;
}

const ALL_PRODUCTS: Array<{
  product: OpportunityProduct;
  system: SourceSystem;
  label: string;
  icon: string;
}> = [
  { product: 'equity', system: 'equity', label: 'Equity Brokerage', icon: '📈' },
  { product: 'mf', system: 'mf', label: 'Mutual Funds', icon: '📊' },
  { product: 'insurance', system: 'insurance', label: 'Insurance Shield', icon: '🛡️' },
  { product: 'loans', system: 'loans', label: 'Credit & Loans', icon: '💳' },
  { product: 'wealth', system: 'wealth', label: 'Private Wealth', icon: '💎' },
];

export const ProductStrip: React.FC<ProductStripProps> = ({ holdings, totalRelationshipValue }) => {
  return (
    <div id="product-strip-container" className="p-5 rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] shadow-xs space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8D5CD]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-[#EBF1FA] text-[#2457A6]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#20252B] uppercase tracking-wide">
              Product Portfolio & Financial Relationship
            </h4>
            <div className="text-xs text-[#68717C]">
              Aggregated across all verified enterprise source holdings
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#68717C]">Total Relationship Value (TRV):</span>
          <span className="font-mono text-base font-extrabold text-[#287A52] bg-[#EBF4EF] px-3 py-1 rounded-md border border-[#A8D3BC]">
            {formatCurrency(totalRelationshipValue)}
          </span>
        </div>
      </div>

      {/* 5 Product Holding Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ALL_PRODUCTS.map((prod) => {
          const holding = holdings.find((h) => h.product === prod.product && h.active);
          const isHeld = !!holding;
          const details = getSourceDetails(prod.system);

          return (
            <div
              key={prod.product}
              id={`product-holding-${prod.product}`}
              className={`p-3.5 rounded-lg border transition-all ${
                isHeld
                  ? 'bg-[#FFFFFF] border-[#D8D5CD] shadow-xs'
                  : 'bg-[#ECEAE4]/60 border-[#D8D5CD] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-base">{prod.icon}</span>
                {isHeld ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#287A52] bg-[#EBF4EF] px-1.5 py-0.5 rounded border border-[#A8D3BC] font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    HELD
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-[#68717C] bg-[#ECEAE4] px-1.5 py-0.5 rounded border border-[#D8D5CD] font-mono">
                    <XCircle className="w-3 h-3" />
                    NONE
                  </span>
                )}
              </div>

              <div className="font-semibold text-xs text-[#20252B] truncate" title={prod.label}>
                {prod.label}
              </div>

              <div className="mt-1.5 pt-1.5 border-t border-[#D8D5CD]">
                {isHeld ? (
                  <div>
                    <div className="font-mono font-bold text-sm text-[#287A52]">
                      {formatCurrency(holding.balance)}
                    </div>
                    {holding.schemeOrPlanName && (
                      <div className="text-[10px] text-[#68717C] truncate mt-0.5" title={holding.schemeOrPlanName}>
                        {holding.schemeOrPlanName}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-[#68717C] italic">No active account</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Proportional Asset Breakdown Bar */}
      {totalRelationshipValue > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-[#68717C]">
            <span>Asset Allocation Distribution:</span>
            <span className="font-semibold text-[#20252B]">100% Portfolio Coverage</span>
          </div>
          <div className="h-2.5 w-full bg-[#ECEAE4] rounded-full overflow-hidden flex border border-[#D8D5CD]">
            {holdings.map((h, i) => {
              const pct = (h.balance / totalRelationshipValue) * 100;
              const details = getSourceDetails(h.system);
              return (
                <div
                  key={i}
                  style={{ width: `${pct}%`, backgroundColor: details.hex }}
                  className="h-full transition-all relative group"
                  title={`${details.name}: ${formatCurrency(h.balance)} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
