import type { DeliveryLocationBody } from '@/api/orders';
import { NIGERIA_LGAS } from '@/constants/nigeria-lgas';
import { HAS_PLACES_KEY } from '@/lib/places';
import type { LocationDraft } from './types';

// A picked or pinned address, or one the user chose to keep as typed. Without a Places key a typed address is enough.
export function isLocationComplete(location: LocationDraft) {
  if (location.address.trim().length < 3) return false;
  return Boolean(location.point) || location.typed || !HAS_PLACES_KEY;
}

const squash = (text: string) => text.toLowerCase().replace(/[^a-z]/g, '');

// The state and local government as the server lists them. Google's spelling can differ, so match
// loosely and leave a blank rather than send a name the server would refuse.
export function matchArea(location: Pick<LocationDraft, 'state' | 'lga'>) {
  const raw = location.state.replace(/\s+state$/i, '').replace(/federal capital territory/i, 'FCT');
  const state = Object.keys(NIGERIA_LGAS).find((name) => squash(name) === squash(raw)) ?? '';
  const lga = state
    ? (NIGERIA_LGAS[state]?.find(
        (name) =>
          squash(name) === squash(location.lga.replace(/\s+(local government area|lga)$/i, ''))
      ) ?? '')
    : '';
  return { state, lga };
}

// What the server wants to know about where the order goes.
export function toDeliveryLocation(location: LocationDraft): DeliveryLocationBody {
  const { state, lga } = matchArea(location);
  return {
    address: location.address.trim().slice(0, 240),
    ...(state ? { state } : {}),
    ...(lga ? { lga } : {}),
    ...(location.city.trim() ? { city: location.city.trim().slice(0, 80) } : {}),
    ...(location.point ? { point: location.point } : {}),
    mapMode: 'map',
  };
}

// The nearest area name to search labs and price requests by.
export const areaOf = (location: LocationDraft) =>
  location.lga || location.city || location.state || location.address.trim().slice(0, 80);
