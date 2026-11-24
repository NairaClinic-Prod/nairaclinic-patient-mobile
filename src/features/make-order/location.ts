import { HAS_PLACES_KEY } from '@/lib/places';
import type { LocationDraft } from './types';

// A picked or pinned address, or one the user chose to keep as typed. Without a Places key a typed address is enough.
export function isLocationComplete(location: LocationDraft) {
  if (location.address.trim().length < 3) return false;
  return Boolean(location.point) || location.typed || !HAS_PLACES_KEY;
}
