import React from 'react';
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { OpportunityProduct, ProductHolding, SourceSystem } from '../../types';
import { formatCurrency, getSourceDetails } from '../../lib/utils';

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
    <div id="product-strip-container" className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-50 text-[#1B4FD8]">
            <TrendingUp size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Product Portfolio Summary
            </h4>
            <div className="text-[10px] text-gray-500">
              Active holding records unified across all operational databases
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">Relationship Value:</span>
          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {formatCurrency(totalRelationshipValue)}
          </span>
        </div>
      </div>

      {/* 5 Product Holding Cards Strip */}
      <div className="grid grid-cols-5 gap-3">
        {ALL_PRODUCTS.map((prod) => {
          const holding = holdings.find((h) => h.product === prod.product && h.active);
          const isHeld = !!holding;

          return (
            <div
              key={prod.product}
              id={`product-holding-${prod.product}`}
              className={`p-3 rounded-lg border transition-all ${
                isHeld
                  ? 'bg-[#F8FAFC] border-blue-200 shadow-2xs'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm">{prod.icon}</span>
                {isHeld ? (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 font-mono">
                    <CheckCircle2 size={10} />
                    HELD
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[9px] font-semibold text-gray-500 bg-gray-100 px-1 py-0.2 rounded border border-gray-200 font-mono">
                    <XCircle size={10} />
                    NONE
                  </span>
                )}
              </div>

              <div className="font-bold text-[11px] text-gray-900 truncate" title={prod.label}>
                {prod.label}
              </div>

              <div className="mt-1 pt-1 border-t border-gray-100">
                {isHeld ? (
                  <div>
                    <div className="font-mono font-bold text-xs text-emerald-700">
                      {formatCurrency(holding.balance)}
                    </div>
                    {holding.schemeOrPlanName && (
                      <div className="text-[9px] text-gray-500 truncate mt-0.5 font-medium" title={holding.schemeOrPlanName}>
                        {holding.schemeOrPlanName}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-400 italic">No account</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Proportional Asset Breakdown Bar */}
      {totalRelationshipValue > 0 && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span>Asset Allocation:</span>
            <span className="font-semibold text-gray-700">100% Core Coverage</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex border border-gray-200">
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
