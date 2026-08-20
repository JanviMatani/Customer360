/**
 * Format a number as Indian currency (₹X.XXL / ₹X.XXCr)
 */
export function formatINR(value: number | null | undefined): string {
  if (value == null) return '—';
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)} Cr`;
  if (value >= 100_000)    return `₹${(value / 100_000).toFixed(2)} L`;
  if (value >= 1_000)      return `₹${(value / 1_000).toFixed(1)} K`;
  return `₹${value.toFixed(0)}`;
}

/**
 * Format confidence as a percentage string
 */
export function formatConfidence(score: number): string {
  return `${score}%`;
}

/**
 * Get a confidence label based on score
 * Note: labels derived from configurable thresholds — these are display hints only
 */
export function confidenceLevel(score: number, autoMerge = 85, reviewLower = 60): 'high' | 'review' | 'low' {
  if (score >= autoMerge) return 'high';
  if (score >= reviewLower) return 'review';
  return 'low';
}

/**
 * Format ISO date string to readable format
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/**
 * Format ISO datetime string
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format product name for display
 */
export function formatProduct(product: string): string {
  const map: Record<string, string> = {
    EQUITY: 'Equity',
    MF: 'Mutual Funds',
    INSURANCE: 'Insurance',
    LOANS: 'Loans',
    WEALTH: 'Wealth',
  };
  return map[product.toUpperCase()] ?? product;
}

/**
 * Get opportunity priority label from score
 */
export function opportunityPriority(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 75) return 'High';
  if (score >= 55) return 'Medium';
  return 'Low';
}

/**
 * Get source system badge color key
 */
export function sourceColor(system: string): string {
  const map: Record<string, string> = {
    EQUITY: 'navy',
    MF: 'teal',
    INSURANCE: 'amber',
    LOANS: 'red',
    WEALTH: 'slate',
  };
  return map[system.toUpperCase()] ?? 'slate';
}
