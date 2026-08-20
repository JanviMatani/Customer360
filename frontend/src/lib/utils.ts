import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MatchDecision, SourceSystem } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Currency formatter for Indian Rupee (INR)
 * >= 1 Crore -> ₹2.4Cr  | >= 1 Lakh -> ₹24L | >= 1000 -> ₹24K
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  if (amount === 0) return '₹0';

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formatted = '';
  if (absAmount >= 10000000) {
    const cr = absAmount / 10000000;
    formatted = `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '')}Cr`;
  } else if (absAmount >= 100000) {
    const lakh = absAmount / 100000;
    formatted = `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2).replace(/\.?0+$/, '')}L`;
  } else if (absAmount >= 1000) {
    const k = absAmount / 1000;
    formatted = `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1).replace(/\.?0+$/, '')}K`;
  } else {
    formatted = `₹${absAmount.toLocaleString('en-IN')}`;
  }

  return isNegative ? `-${formatted}` : formatted;
}

export function formatFullINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  } catch {
    return dateString;
  }
}

export function maskPAN(pan?: string): string {
  if (!pan) return '—';
  const clean = pan.trim();
  if (clean.length <= 4) return '****';
  return `${clean.slice(0, 4)}****`;
}

export function maskMobile(mobile?: string): string {
  if (!mobile) return '—';
  const clean = mobile.replace(/\D/g, '');
  if (clean.length <= 5) return '*****';
  return `${clean.slice(0, 5)}*****`;
}

export function maskEmail(email?: string): string {
  if (!email) return '—';
  const parts = email.split('@');
  if (parts.length !== 2) return '****';
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) return `${name.slice(0, 1)}****@${domain}`;
  return `${name.slice(0, 2)}****@${domain}`;
}

export function getConfidenceDecision(score: number, autoMerge = 85, manualReview = 60): MatchDecision {
  if (score >= autoMerge) return 'auto_merge';
  if (score >= manualReview) return 'manual_review';
  return 'separate';
}

export function getConfidenceBadgeProps(score: number, autoMerge = 85, manualReview = 60) {
  if (score >= autoMerge) {
    return {
      label: 'AUTO MERGE',
      bgClass: 'bg-[#EBF4EF] border-[#A8D3BC] text-[#287A52]',
      dotClass: 'bg-[#287A52]',
      color: 'emerald',
    };
  }
  if (score >= manualReview) {
    return {
      label: 'MANUAL REVIEW',
      bgClass: 'bg-[#FBF4EB] border-[#E8CEAB] text-[#A66A16]',
      dotClass: 'bg-[#A66A16]',
      color: 'amber',
    };
  }
  return {
    label: 'SEPARATE',
    bgClass: 'bg-[#F9ECEC] border-[#E8B8B8] text-[#B84242]',
    dotClass: 'bg-[#B84242]',
    color: 'rose',
  };
}

export function getSourceDetails(source: SourceSystem | string) {
  switch (source.toLowerCase()) {
    case 'equity':
      return { code: 'EQ', name: 'Equity Brokerage', color: 'bg-[#EBF1FA] text-[#2457A6] border-[#BCD1F0]', hex: '#2457A6' };
    case 'mf':
      return { code: 'MF', name: 'Mutual Funds', color: 'bg-[#F2EDFA] text-[#6A3BB8] border-[#D6C7F0]', hex: '#6A3BB8' };
    case 'insurance':
      return { code: 'INS', name: 'General & Life Insurance', color: 'bg-[#EBF4EF] text-[#287A52] border-[#A8D3BC]', hex: '#287A52' };
    case 'loans':
      return { code: 'LOAN', name: 'Retail & Home Loans', color: 'bg-[#FBF4EB] text-[#A66A16] border-[#E8CEAB]', hex: '#A66A16' };
    case 'wealth':
      return { code: 'WLT', name: 'Private Wealth Management', color: 'bg-[#FAF0F5] text-[#9E2B6C] border-[#ECC8DE]', hex: '#9E2B6C' };
    default:
      return { code: source.toUpperCase().slice(0, 3), name: source, color: 'bg-[#ECEAE4] text-[#20252B] border-[#D8D5CD]', hex: '#68717C' };
  }
}

export function getOpportunityProductLabel(product: string): string {
  switch (product) {
    case 'equity': return 'Direct Equity';
    case 'mf': return 'Mutual Funds';
    case 'insurance': return 'Insurance';
    case 'loans': return 'Loans / LAS';
    case 'wealth': return 'Wealth Management';
    default: return product;
  }
}

export function getOpportunityStatusProps(status: string) {
  switch (status) {
    case 'new':
      return { label: 'NEW', bgClass: 'bg-[#EBF1FA] text-[#2457A6] border-[#BCD1F0]' };
    case 'in_progress':
      return { label: 'IN PROGRESS', bgClass: 'bg-[#FBF4EB] text-[#A66A16] border-[#E8CEAB]' };
    case 'converted':
      return { label: 'CONVERTED', bgClass: 'bg-[#EBF4EF] text-[#287A52] border-[#A8D3BC]' };
    case 'dismissed':
      return { label: 'DISMISSED', bgClass: 'bg-[#ECEAE4] text-[#68717C] border-[#D8D5CD]' };
    default:
      return { label: status.toUpperCase(), bgClass: 'bg-[#ECEAE4] text-[#68717C] border-[#D8D5CD]' };
  }
}

/**
 * Jaro-Winkler similarity (returns 0-100)
 */
export function jaroWinklerSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  const a = s1.trim().toLowerCase();
  const b = s2.trim().toLowerCase();
  if (a === b) return 100;

  const len1 = a.length;
  const len2 = b.length;
  if (len1 === 0 || len2 === 0) return 0;

  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
  const aMatches = new Array(len1).fill(false);
  const bMatches = new Array(len2).fill(false);

  let matches = 0;
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);
    for (let j = start; j < end; j++) {
      if (bMatches[j]) continue;
      if (a[i] !== b[j]) continue;
      aMatches[i] = true;
      bMatches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let k = 0;
  let transpositions = 0;
  for (let i = 0; i < len1; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }

  const sim = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }
  const jw = sim + prefix * 0.1 * (1 - sim);
  return Math.round(jw * 100);
}

export function normalizeName(name?: string): string {
  if (!name) return '';
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeMobile(mobile?: string): string {
  if (!mobile) return '';
  let digits = mobile.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  return digits;
}
