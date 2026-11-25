import type { RawOffer, RawShopping } from '@/api/orders';
import type { PharmacyCombination, PharmacyLine, PharmacyResult } from './types';

function toResult(offer: RawOffer, raw: RawShopping): PharmacyResult {
  const profile = offer.pharmacy?.facilityProfile;
  const address = (profile?.addressJson ?? {}) as Record<string, unknown>;
  const lines: PharmacyLine[] = raw.items.map((item) => {
    const line = offer.lines.find((entry) => entry.shoppingRequestItemId === item.id);
    const have = line?.quantityOffered ?? 0;
    return {
      name: item.prescribedName,
      quantity: item.quantityRequested,
      unitPriceKobo: line?.unitPriceKobo ?? null,
      have: line?.unitPriceKobo == null ? 0 : have,
    };
  });
  return {
    id: offer.pharmacyUserId,
    name: offer.headOfficeName || profile?.legalName || 'Pharmacy',
    branch: offer.branchName ?? null,
    address: [address.address, address.city, address.state]
      .filter((part): part is string => typeof part === 'string' && part.length > 0)
      .join(', '),
    distanceMeters: offer.distanceMeters ?? 0,
    etaMinutes: offer.etaMinutes ?? 0,
    match: offer.matchType ?? 'none',
    stockListed: offer.stockListed ?? true,
    lines,
    subtotalKobo: offer.estimatedSubtotalKobo ?? 0,
    deliveryFeeKobo: offer.deliveryFeeKobo ?? 0,
    serviceFeeKobo: offer.serviceFeeKobo ?? 0,
    totalKobo: offer.estimatedTotalKobo ?? 0,
  };
}

// The pharmacies for a request the one-pharmacy way, nearest first, and the cheapest split when no
// single pharmacy has everything.
export function toLegacyResults(raw: RawShopping): {
  offers: PharmacyResult[];
  combination: PharmacyCombination | null;
} {
  const offers = raw.offers
    .map((offer) => toResult(offer, raw))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
  const combination = raw.combination
    ? {
        totalKobo: raw.combination.totalKobo,
        parts: raw.combination.parts.flatMap((part) => {
          const pharmacy = offers.find((offer) => offer.id === part.pharmacyUserId);
          if (!pharmacy) return [];
          return [
            {
              pharmacy,
              lines: pharmacy.lines.filter((_, index) =>
                part.itemIds.includes(raw.items[index]?.id ?? '')
              ),
              subtotalKobo: part.subtotalKobo,
              deliveryFeeKobo: part.deliveryFeeKobo,
              serviceFeeKobo: part.serviceFeeKobo,
            },
          ];
        }),
      }
    : null;
  return { offers, combination };
}
