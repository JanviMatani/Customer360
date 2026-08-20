import React, { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { maskEmail, maskMobile, maskPAN } from '../../lib/utils';

interface MaskedFieldProps {
  value?: string | null;
  type: 'pan' | 'mobile' | 'email' | 'text';
  label?: string;
  allowReveal?: boolean;
  className?: string;
  id?: string;
}

export const MaskedField: React.FC<MaskedFieldProps> = ({
  value,
  type,
  label,
  allowReveal = true,
  className = '',
  id,
}) => {
  const [revealed, setRevealed] = useState(false);

  if (!value) {
    return <span className="text-[#68717C] italic text-xs">Not provided</span>;
  }

  let maskedValue = value;
  if (type === 'pan') maskedValue = maskPAN(value);
  else if (type === 'mobile') maskedValue = maskMobile(value);
  else if (type === 'email') maskedValue = maskEmail(value);
  else {
    maskedValue = value.length > 4 ? `${value.slice(0, 2)}****${value.slice(-2)}` : '****';
  }

  const displayValue = revealed ? value : maskedValue;

  return (
    <span
      id={id || `masked-field-${type}`}
      className={`inline-flex items-center gap-1.5 font-mono text-[#20252B] group ${className}`}
      title={revealed ? 'Sensitive PII Revealed' : 'Sensitive Data Masked (DPDP Act & PCI-DSS Compliance)'}
    >
      <span className={revealed ? 'text-[#2457A6] font-semibold' : 'text-[#20252B]'}>
        {displayValue}
      </span>
      {allowReveal && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setRevealed(!revealed);
          }}
          className="p-0.5 text-[#68717C] hover:text-[#2457A6] hover:bg-[#ECEAE4] rounded transition-colors cursor-pointer"
          title={revealed ? 'Hide sensitive data' : 'Click to unmask (Audited action)'}
        >
          {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      )}
    </span>
  );
};
