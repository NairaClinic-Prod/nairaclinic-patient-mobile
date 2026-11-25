import { useQuery } from '@tanstack/react-query';
import { request } from '../client';
import { ApiError } from '../http';
import { queryClient } from '../query-client';
import { PAYMENT_ENDPOINTS, pay, paymentCallback, refreshPayments, settlePayment } from '../payments';
import type { PaymentReply, PayOutcome } from '../payments';
import { ordersApi } from './endpoint.api';
import { toOpenRequest, toOrder, toRequestDetail } from './map';
import type {
  NewShoppingRequest,
  PharmacyChoice,
  PharmacyOrder,
  RawOrder,
  RawShopping,
  ShoppingRequest,
} from './type';

export * from './type';
export { ordersApi } from './endpoint.api';
export { ORDER_ENDPOINTS } from './endpoints';
export { toOrder, toOpenRequest, toRequestDetail } from './map';

export const orderKeys = {
  all: ['orders'] as const,
  orders: ['orders', 'list'] as const,
  requests: ['orders', 'requests'] as const,
  request: (id: string) => ['orders', 'request', id] as const,
  quote: (id: string, pharmacyIds: string, version: string) =>
    ['orders', 'request', id, 'quote', pharmacyIds, version] as const,
};

const LIVE: string[] = ['new', 'quoted', 'accepted', 'preparing', 'ready'];

export const useOrdersQuery = () =>
  useQuery({
    queryKey: orderKeys.orders,
    queryFn: async () => (await ordersApi.orders()).map(toOrder),
    // Live orders refresh by themselves; finished ones don't need to.
    refetchInterval: (query) =>
      query.state.data?.some((order) => LIVE.includes(order.status)) ? 30_000 : false,
  });

export const useRequestsQuery = () =>
  useQuery({
    queryKey: orderKeys.requests,
    queryFn: async () => (await ordersApi.requests()).map(toOpenRequest),
    refetchInterval: 60_000,
  });

// One request with every pharmacy reply. `base` carries what the list already knew.
export const useRequestQuery = (id: string | null, base?: ShoppingRequest | null) =>
  useQuery({
    queryKey: orderKeys.request(id ?? ''),
    queryFn: async () => toRequestDetail(await ordersApi.request(id as string), base ?? undefined),
    enabled: Boolean(id),
    refetchInterval: 20_000,
    staleTime: 5_000,
  });

export async function refreshOrders() {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: orderKeys.all }),
    refreshPayments(),
  ]);
}

function keepRequest(raw: RawShopping, id: string) {
  const base = queryClient.getQueryData<ShoppingRequest>(orderKeys.request(id));
  const next = toRequestDetail(raw, base);
  queryClient.setQueryData(orderKeys.request(id), next);
  queryClient.invalidateQueries({ queryKey: orderKeys.requests });
  return next;
}

// --- orders -----------------------------------------------------------------------------------

export async function cancelOrder(id: string) {
  const raw = await ordersApi.cancelOrder(id);
  queryClient.setQueryData<PharmacyOrder[]>(orderKeys.orders, (list = []) =>
    list.map((order) => (order.id === id ? toOrder(raw) : order))
  );
  await refreshOrders();
}

export async function payOrder(id: string): Promise<PayOutcome> {
  const outcome = await pay({
    endpoint: PAYMENT_ENDPOINTS.pharmacyRequest(id),
    callbackQuery: { order: id },
    unconfirmed: "We couldn't confirm your payment yet. Open the order again in a moment to see its status.",
  });
  await refreshOrders();
  return outcome;
}

// --- requests ---------------------------------------------------------------------------------

export async function cancelRequest(id: string) {
  await ordersApi.cancelRequest(id);
  await refreshOrders();
}

export async function createRequest(body: NewShoppingRequest) {
  const raw = await ordersApi.createRequest(body);
  const detail = keepRequest(raw, raw.id);
  return { raw, detail };
}

export async function askAllPharmacies(id: string) {
  return keepRequest(await ordersApi.askAll(id), id);
}

export async function widenSearch(id: string) {
  return keepRequest(await ordersApi.widen(id), id);
}

export async function itemAction(id: string, itemId: string, action: 'cancel' | 'ask_again') {
  return keepRequest(await ordersApi.itemAction(id, itemId, action), id);
}

export async function sendRequest(id: string, choice: PharmacyChoice): Promise<RawOrder[]> {
  const { requests } = await ordersApi.dispatch(id, choice);
  await refreshOrders();
  return requests;
}

export const quoteRequest = (id: string, pharmacyIds: string[]) => ordersApi.quote(id, pharmacyIds);

// The price moved between choosing and paying; the new total is what to show.
export class PriceChangedError extends Error {
  constructor(readonly totalKobo: number) {
    super('The price changed. Please review the new total.');
    this.name = 'PriceChangedError';
  }
}

function newTotal(error: ApiError) {
  const body = error.body as Record<string, any> | null | undefined;
  const value = body?.totalKobo ?? body?.message?.totalKobo ?? body?.data?.totalKobo;
  return typeof value === 'number' ? value : null;
}

// Order now: the server re-prices the chosen pharmacies, then takes payment (wallet first).
export async function orderFromPharmacies(input: {
  requestId: string;
  pharmacyIds: string[];
  expectedTotalKobo: number;
  allowPartial?: boolean;
}): Promise<PayOutcome> {
  try {
    const reply = await request<{ requests: { id: string }[]; payment: PaymentReply }>(
      PAYMENT_ENDPOINTS.pharmacyOrder(input.requestId),
      {
        body: {
          pharmacyIds: input.pharmacyIds,
          expectedTotalKobo: input.expectedTotalKobo,
          callbackUrl: paymentCallback({ order: input.requestId }),
          ...(input.allowPartial ? { allowPartial: true } : {}),
        },
        timeoutMs: 45_000,
      }
    );
    const outcome = await settlePayment(reply.payment);
    await refreshOrders();
    return outcome;
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      const total = newTotal(error);
      if (error.code === 'PRICE_CHANGED' && total !== null) throw new PriceChangedError(total);
    }
    throw error;
  }
}
