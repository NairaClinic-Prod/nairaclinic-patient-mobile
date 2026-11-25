// Labels that aren't a person's name, so they never get "Dr."
const GENERIC = /^(your doctor|doctor|nairaclinic doctor|nairaclinic|external prescriber)$/i;

// "Jamiu Agbabiaka" becomes "Dr. Jamiu Agbabiaka", never "Dr. Dr. …".
export function drName(name: string | null | undefined, fallback = 'your doctor'): string {
  const trimmed = (name ?? '').trim();
  const bare = trimmed.replace(/^dr\.?\s+/i, '');
  if (!bare) return fallback;
  if (GENERIC.test(bare)) return trimmed;
  return `Dr. ${bare}`;
}
