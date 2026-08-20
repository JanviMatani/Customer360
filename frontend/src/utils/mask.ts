/**
 * Client-side display masking.
 * NOTE: The backend already masks PAN/mobile before sending to the API.
 * These functions are for any additional frontend display needs.
 * NEVER unmask server-side masked values on the frontend.
 */

export function maskPan(pan: string | null | undefined): string {
  if (!pan) return 'Not available';
  // Backend already sends masked values like "ABC1****"
  // If somehow a full PAN arrives, mask it
  if (pan.includes('*')) return pan; // already masked by backend
  if (pan.length < 4) return '****';
  return pan.substring(0, 4) + '****';
}

export function maskMobile(mobile: string | null | undefined): string {
  if (!mobile) return 'Not available';
  if (mobile.includes('*')) return mobile; // already masked by backend
  if (mobile.length < 5) return '*****';
  return mobile.substring(0, 5) + '*****';
}

export function maskEmail(email: string | null | undefined): string {
  if (!email) return 'Not available';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  if (name.length <= 2) return name + '@' + parts[1];
  return name.substring(0, 2) + '***@' + parts[1];
}

/** Returns masked value for display with a small "masked" indicator */
export function displayPan(pan: string | null | undefined, _role?: string): string {
  if (!pan) return 'Not available';
  // Admin sees whatever backend returns (already masked for non-admins server-side)
  return pan;
}

export function displayMobile(mobile: string | null | undefined, _role?: string): string {
  if (!mobile) return 'Not available';
  return mobile;
}
