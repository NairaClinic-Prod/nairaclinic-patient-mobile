import type {
  OrderStatus,
  PharmacyOffer,
  PharmacyOrder,
  RawOffer,
  RawOpenRequest,
  RawOrder,
  RawShopping,
  RequestItem,
  ShoppingRequest,
} from './type';

const DELIVERY_LABEL: Record<string, string> = {
  preparing: 'Rider requested · finding a driver',
  awaiting_pickup: 'Driver on the way to the pharmacy',
  in_transit: 'Driver on the way to you',
  delivered: 'Delivered',
  cancelled: 'Rider cancelled · the pharmacy will rebook',
  failed: 'Delivery problem · the pharmacy will rebook',
};

const CANCELLABLE: OrderStatus[] = ['new', 'quoted'];
const ITEM_STATUSES = ['open', 'available', 'pending', 'ordered', 'cancelled'];

function etaText(eta: NonNullable<RawOrder['delivery']>['eta']) {
  if (!eta || eta.phase === 'delivered' || eta.phase === 'ended') return null;
  if (typeof eta.minutesLeft === 'number') {
    const minutes = Math.max(1, Math.round(eta.minutesLeft));
    return `${eta.rough ? 'About ' : ''}${minutes} min to arrive`;
  }
  return null;
}

export function toOrder(raw: RawOrder): PharmacyOrder {
  const quote = raw.quote ?? null;
  const line = (itemId: string) => quote?.lines.find((entry) => entry.itemId === itemId);
  const delivery = raw.delivery ?? null;
  return {
    id: raw.id,
    reference: raw.reference,
    shoppingRequestId: raw.shoppingRequestId ?? null,
    status: raw.status,
    createdAt: raw.createdAt,
    pharmacyName: raw.pharmacy.name,
    pharmacyAddress: raw.pharmacy.address ?? null,
    pharmacyState: raw.pharmacy.state ?? null,
    pharmacyPhone: raw.pharmacy.phone ?? null,
    fulfilment: raw.fulfilment,
    deliveryArea: raw.deliveryArea ?? null,
    deliveryAddress: raw.deliveryAddress ?? null,
    items: raw.items.map((item) => {
      const priced = line(item.id);
      return {
        id: item.id,
        name: item.name,
        strength: item.strength ?? '',
        quantity: item.quantity ?? 1,
        unitPriceKobo: priced?.available ? priced.unitPriceKobo : null,
      };
    }),
    totalKobo: quote?.totalKobo ?? null,
    deliveryFeeKobo: quote?.deliveryFeeKobo ?? 0,
    serviceFeeKobo: quote?.serviceFeeKobo ?? 0,
    paid: Boolean(raw.paidAtUtc),
    paymentPending: raw.status === 'quoted' && Boolean(quote?.autoPriced),
    cancellable: raw.cancellable ?? CANCELLABLE.includes(raw.status),
    collectionCode: raw.collectionCode ?? null,
    declineReason: raw.declineReason ?? null,
    deliveryStatus: delivery ? (DELIVERY_LABEL[delivery.status] ?? delivery.status) : null,
    trackingUrl: delivery?.trackingUrl ?? null,
    rider: delivery?.rider
      ? { name: delivery.rider.name ?? null, phone: delivery.rider.phone ?? null }
      : null,
    etaText: delivery ? etaText(delivery.eta) : null,
    contactName: '',
    contactPhone: '',
    timeline: raw.timeline ?? [],
  };
}

const requestStatus = (status?: string): ShoppingRequest['status'] =>
  status === 'expired' ? 'expired' : status === 'cancelled' ? 'cancelled' : 'open';

// The list gives the basics of each request. The pharmacy replies come from the full request.
export function toOpenRequest(raw: RawOpenRequest): ShoppingRequest {
  return {
    id: raw.id,
    reference: raw.reference || `RQ-${raw.id.slice(-6).toUpperCase()}`,
    createdAt: raw.createdAt,
    status: requestStatus(raw.status),
    fulfilment: raw.fulfilment ?? 'delivery',
    area: raw.area ?? null,
    items: raw.items.map(
      (item, index): RequestItem => ({
        id: `${raw.id}:${index}`,
        name: item.name,
        status: item.status,
        quantity: item.quantity ?? 1,
      })
    ),
    replies: raw.replies,
    waiting: raw.waiting,
    deliveryAddress: null,
    expiresAt: raw.expiredAt ?? null,
    offers: [],
    timeline: [],
    orders: [],
    detailed: false,
    maxPharmacies: 4,
    search: null,
    returnPolicy: null,
  };
}

const join = (names: string[]) =>
  names.length <= 1
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

function searchText(search: NonNullable<RawShopping['search']>) {
  const wide = search.scope === 'wide';
  const searched =
    !search.byArea || !search.home
      ? wide
        ? `up to about ${search.wideRadiusKm ?? 20} km from you`
        : 'near you'
      : `in ${join(wide ? [search.home, ...(search.wider ?? [])] : [search.home])}`;
  const wider = !search.byArea
    ? `pharmacies up to about ${search.wideRadiusKm ?? 20} km away`
    : search.wider?.length
      ? `pharmacies in ${join(search.wider)}, the areas closest to you`
      : 'pharmacies in the areas next to yours';
  return { searched, wider };
}

function toOffer(raw: RawOffer, items: RequestItem[]): PharmacyOffer {
  const profile = raw.pharmacy?.facilityProfile;
  const address = (profile?.addressJson ?? {}) as Record<string, unknown>;
  const lines = raw.lines.map((line) => ({
    itemId: line.shoppingRequestItemId,
    unitPriceKobo: line.unitPriceKobo ?? null,
    quantity: line.quantityOffered ?? 0,
  }));
  const open = items.filter((item) => item.status !== 'ordered' && item.status !== 'cancelled');
  const counted = open.filter((item) => {
    const line = lines.find((entry) => entry.itemId === item.id);
    return line && line.unitPriceKobo !== null && line.quantity >= item.quantity;
  }).length;
  return {
    id: raw.id,
    pharmacyId: raw.pharmacyUserId,
    name: raw.headOfficeName || profile?.legalName || 'Pharmacy',
    branch: raw.branchName ?? null,
    replied: raw.replied ?? false,
    asked: Boolean(raw.askStatus),
    covers: raw.covers ?? counted,
    estimatedTotalKobo: raw.estimatedTotalKobo ?? 0,
    deliveryFeeKobo: raw.deliveryFeeKobo ?? 0,
    distanceMeters: raw.distanceMeters ?? null,
    etaMinutes: raw.etaMinutes ?? null,
    address: [address.address, address.city, address.state]
      .filter((part): part is string => typeof part === 'string' && part.length > 0)
      .join(', '),
    lines,
  };
}

export function toRequestDetail(raw: RawShopping, base?: ShoppingRequest): ShoppingRequest {
  const items: RequestItem[] = raw.items.map((item) => ({
    id: item.id,
    name: item.prescribedName,
    quantity: item.quantityRequested,
    brand: item.brand ?? null,
    status: ITEM_STATUSES.includes(item.status ?? '') ? (item.status as string) : 'open',
  }));
  const search = raw.search ? searchText(raw.search) : null;
  const responded = raw.offers.filter((offer) => offer.replied).length;
  return {
    id: raw.id,
    reference: base?.reference ?? `RQ-${raw.id.slice(-6).toUpperCase()}`,
    createdAt: raw.createdAt ?? base?.createdAt ?? new Date().toISOString(),
    status: requestStatus(raw.status ?? base?.status),
    fulfilment: raw.fulfilment ?? base?.fulfilment ?? 'delivery',
    area: raw.deliveryArea ?? base?.area ?? null,
    items,
    replies: responded,
    waiting: raw.offers.filter((offer) => offer.askStatus === 'sent' && !offer.replied).length,
    deliveryAddress: raw.deliveryAddress ?? base?.deliveryAddress ?? null,
    expiresAt: base?.expiresAt ?? null,
    offers: raw.offers.map((offer) => toOffer(offer, items)),
    timeline: (raw.timeline ?? []).map((entry) => ({
      at: entry.at,
      tone: entry.tone ?? 'info',
      text: entry.text,
    })),
    orders: (raw.orders ?? []).map((order) => ({
      id: order.id,
      reference: order.reference,
      status: order.status,
      pharmacyName: order.pharmacyName,
      totalKobo: order.totalKobo,
      paid: order.paid,
    })),
    detailed: true,
    maxPharmacies: raw.engine?.rules?.maxPharmaciesPerOrder ?? 4,
    search: raw.search
      ? {
          widerSuggested: Boolean(raw.search.widerSuggested),
          widerText: search?.wider ?? '',
          searchedText: search?.searched ?? '',
        }
      : null,
    returnPolicy: raw.engine?.rules?.returnPolicy?.text ?? null,
  };
}
