export type CardBrand = 'visa' | 'mastercard' | 'verve' | 'amex' | 'other';

// Paystack sends brand names in mixed spellings, so match on the letters only.
export function detectBrand(raw: string | null | undefined): CardBrand {
  const value = (raw ?? '').toLowerCase().replace(/[^a-z]/g, '');
  if (value.includes('visa')) return 'visa';
  if (value.includes('master') || value === 'mc' || value.includes('maestro')) return 'mastercard';
  if (value.includes('verve')) return 'verve';
  if (value.includes('amex') || value.includes('americanexpress')) return 'amex';
  return 'other';
}

export const BRAND_NAME: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  verve: 'Verve',
  amex: 'American Express',
  other: 'Card',
};

export const BRAND_COLORS: Record<CardBrand, [string, string]> = {
  visa: ['#1f4fc1', '#0c2468'],
  mastercard: ['#34343f', '#121218'],
  verve: ['#12806a', '#08443a'],
  amex: ['#2a7bb8', '#124468'],
  other: ['#3f4a5c', '#1b212c'],
};
