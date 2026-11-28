import { specialtyName } from './components/specialty-field';

type Kind = { category?: string | null; specialty?: string | null };

// old requests have no category, so they keep the label they always had
export function kindLabel(kind: Kind, fallback: string) {
  if (kind.category === 'specialist') {
    return kind.specialty
      ? `Specialist · ${specialtyName(kind.specialty)}`
      : 'Specialist consultation';
  }
  if (kind.category === 'general') return 'General consultation';
  return fallback;
}
