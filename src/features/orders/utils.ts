import type { PillTone } from '@/components/shared/status-pill';
import { OPEN_STATUSES, ORDER_STATUS_LABEL, VIEW_STATUSES } from './constants';
import type {
  OrdersData,
  OrderStatus,
  PharmacyOffer,
  PharmacyOrder,
  RequestItem,
  ShoppingRequest,
} from './types';

const NAIRA = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const WHEN = new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

const DAY = new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatNaira = (kobo: number) => NAIRA.format(kobo / 100);
export const formatWhen = (iso: string) => WHEN.format(new Date(iso));
export const formatDay = (iso: string) => DAY.format(new Date(iso));

export function orderTone(status: OrderStatus): PillTone {
  if (status === 'quoted' || status === 'ready') return 'pending';
  if (status === 'new' || status === 'accepted' || status === 'preparing') return 'info';
  if (status === 'completed') return 'active';
  return 'inactive';
}

export const orderStatusLabel = (order: Pick<PharmacyOrder, 'status' | 'paymentPending'>) =>
  order.paymentPending ? 'Payment pending' : ORDER_STATUS_LABEL[order.status];

export function statusLine(order: PharmacyOrder) {
  const priced = order.status === 'quoted' && order.totalKobo !== null;
  if (order.paymentPending) return 'Payment not confirmed yet';
  if (priced) return `Price ready · ${formatNaira(order.totalKobo ?? 0)} to pay`;
  switch (order.status) {
    case 'new':
      return `Waiting for ${order.pharmacyName} to reply`;
    case 'accepted':
      return `Paid · waiting for ${order.pharmacyName} to accept`;
    case 'preparing':
      return `${order.pharmacyName} is preparing your order`;
    case 'ready':
      return 'Ready · open it for your collection code';
    default:
      return order.pharmacyName;
  }
}

export function paymentLabel(order: PharmacyOrder) {
  if (order.paid) return 'Paid';
  if (order.paymentPending) return 'Payment not confirmed';
  return order.status === 'quoted' ? 'Not paid yet' : 'No payment yet';
}

export function primaryLabel(order: PharmacyOrder) {
  if (order.paymentPending) return 'Payment status';
  if (order.status === 'quoted') return 'Review offer';
  return order.status === 'new' ? 'View request' : 'View order';
}

// A request that already has a live order is counted once, through that order.
export function summarize(data: OrdersData) {
  const open = data.orders.filter((order) => OPEN_STATUSES.includes(order.status));
  const toPay = open.filter((order) => order.status === 'quoted');
  const live = data.orders.filter(
    (order) =>
      VIEW_STATUSES.requests.includes(order.status) || VIEW_STATUSES.active.includes(order.status)
  );
  const covered = new Set(live.map((order) => order.shoppingRequestId).filter(Boolean));
  const requests = data.requests.filter(
    (request) => request.status === 'open' && !covered.has(request.id)
  );
  return {
    inProgress: open.length,
    toPayCount: toPay.length,
    toPayKobo: toPay.reduce((sum, order) => sum + (order.totalKobo ?? 0), 0),
    ready: open.filter((order) => order.status === 'ready').length,
    activeCount: live.length + requests.length,
  };
}

export const medicineLine = (item: RequestItem | { name: string; quantity: number }) =>
  `${item.name} × ${item.quantity} ${item.quantity === 1 ? 'pack' : 'packs'}`;

export const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;

export const OPEN_ITEM_STATUSES = ['open', 'available', 'pending'];

export const distanceLabel = (meters: number) =>
  meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`;

export const hasLine = (offer: PharmacyOffer, item: RequestItem) => {
  const line = offer.lines.find((entry) => entry.itemId === item.id);
  return Boolean(line && line.unitPriceKobo !== null && line.quantity >= item.quantity);
};

// Each medicine goes to the cheapest chosen pharmacy that has it; delivery is charged once per pharmacy used.
export function quoteFor(request: ShoppingRequest, chosenIds: string[]) {
  const chosen = request.offers.filter((offer) => chosenIds.includes(offer.pharmacyId));
  const open = request.items.filter((item) => OPEN_ITEM_STATUSES.includes(item.status));
  const used = new Set<string>();
  let medicinesKobo = 0;
  let covered = 0;

  for (const item of open) {
    let best: { kobo: number; pharmacyId: string } | null = null;
    for (const offer of chosen) {
      const line = offer.lines.find((entry) => entry.itemId === item.id);
      if (!line || line.unitPriceKobo === null || line.quantity < item.quantity) continue;
      const kobo = line.unitPriceKobo * item.quantity;
      if (!best || kobo < best.kobo) best = { kobo, pharmacyId: offer.pharmacyId };
    }
    if (best) {
      medicinesKobo += best.kobo;
      covered += 1;
      used.add(best.pharmacyId);
    }
  }

  const deliveryKobo = chosen
    .filter((offer) => used.has(offer.pharmacyId))
    .reduce((sum, offer) => sum + offer.deliveryFeeKobo, 0);

  return {
    open: open.length,
    covered,
    pharmacies: used.size,
    totalKobo: medicinesKobo + deliveryKobo,
  };
}
