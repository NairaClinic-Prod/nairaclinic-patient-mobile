const WEAK_PINS = [
  '00000',
  '11111',
  '12345',
  '22222',
  '33333',
  '44444',
  '55555',
  '66666',
  '77777',
  '88888',
  '99999',
];

// Same rules as the patient website, so the backend accepts what the app sends.
export function validatePhone(phone: string): {
  valid: boolean;
  formatted: string;
  error?: string;
} {
  const trimmed = phone.trim();
  const cleaned = trimmed.replace(/\D/g, '');
  const invalid = {
    valid: false,
    formatted: phone,
    error: 'Enter a valid phone number, like 08012345678 or one with your country code',
  };

  if (trimmed.startsWith('+')) {
    return cleaned.length >= 7 && cleaned.length <= 15
      ? { valid: true, formatted: `+${cleaned}` }
      : invalid;
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return { valid: true, formatted: `+234${cleaned.slice(1)}` };
  }
  if (cleaned.length === 10 && /^[789]/.test(cleaned)) {
    return { valid: true, formatted: `+234${cleaned}` };
  }
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    return { valid: true, formatted: `+${cleaned}` };
  }
  return invalid;
}

export function validatePin(pin: string, options: { allowWeak?: boolean } = {}) {
  if (!pin) return { valid: false, error: 'PIN is required' };
  if (!/^\d{5}$/.test(pin)) return { valid: false, error: 'PIN must be 5 digits' };
  if (!options.allowWeak && WEAK_PINS.includes(pin)) {
    return { valid: false, error: 'Please choose a more secure PIN' };
  }
  return { valid: true as const, error: undefined };
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function splitName(name: string) {
  const [firstName = '', ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
}

// The number is typed without the country code, which the country picker supplies.
export function validateNationalPhone(dial: string, national: string) {
  const digits = national.replace(/\D/g, '').replace(/^0+/, '');
  const formatted = `${dial}${digits}`;

  if (dial === '+234') {
    return /^[789]\d{9}$/.test(digits)
      ? { valid: true as const, formatted, error: undefined }
      : {
          valid: false as const,
          formatted,
          error: 'Enter a valid Nigerian number, like +234801 234 5678',
        };
  }

  const total = formatted.replace(/\D/g, '').length;
  return total >= 7 && total <= 15
    ? { valid: true as const, formatted, error: undefined }
    : { valid: false as const, formatted, error: 'Enter a valid phone number' };
}
