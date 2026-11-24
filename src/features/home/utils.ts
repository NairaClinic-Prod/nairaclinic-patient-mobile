const WHEN = new Intl.DateTimeFormat('en-NG', {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

// Lagos is UTC+1 all year, so the greeting follows it wherever the phone is.
export function greeting() {
  const hour = (new Date().getUTCHours() + 1) % 24;
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export function displayName(name: string) {
  if (name !== name.toUpperCase()) return name;
  return name.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (match) => match.toUpperCase());
}

export function drName(name: string) {
  return `Dr. ${displayName(name).replace(/^dr\.?\s+/i, '')}`;
}

export function initials(name: string) {
  return name
    .replace(/^dr\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatWhen(iso: string | null) {
  return iso ? WHEN.format(new Date(iso)) : 'Time to be confirmed';
}

const MONTH = new Intl.DateTimeFormat('en-NG', { month: 'short' });

export function dateParts(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  return { month: MONTH.format(date).toUpperCase(), day: String(date.getDate()) };
}

export function relativeDay(iso: string | null) {
  if (!iso) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - start.getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}
