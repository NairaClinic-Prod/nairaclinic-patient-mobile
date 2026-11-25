import { request } from '../client';
import { ORDER_ENDPOINTS } from './endpoints';
import type {
  NewShoppingRequest,
  PharmacyChoice,
  RawOpenRequest,
  RawOrder,
  RawShopping,
  ShoppingQuote,
} from './type';

const MAX_PAGES = 5;

export const ordersApi = {
  // All the patient's pharmacy orders, newest first.
  async orders(): Promise<RawOrder[]> {
    const all: RawOrder[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const reply = await request<{ requests: RawOrder[]; meta?: { hasMore?: boolean } }>(
        `${ORDER_ENDPOINTS.orders}?page=${page}&limit=100`
      );
      all.push(...reply.requests);
      if (!reply.meta?.hasMore) break;
    }
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
  },

  order: (id: string) => request<RawOrder>(`${ORDER_ENDPOINTS.orders}/${encodeURIComponent(id)}`),

  cancelOrder: (id: string) => request<RawOrder>(ORDER_ENDPOINTS.cancelOrder(id), { body: {} }),

  requests: () =>
    request<{ requests: RawOpenRequest[] }>(ORDER_ENDPOINTS.requests).then((reply) => reply.requests),

  request: (id: string) => request<RawShopping>(ORDER_ENDPOINTS.request(id)),

  createRequest: (body: NewShoppingRequest) =>
    request<RawShopping & { engine?: unknown }>(ORDER_ENDPOINTS.requests, { body }),

  cancelRequest: (id: string) => request<unknown>(ORDER_ENDPOINTS.cancelRequest(id), { body: {} }),

  askAll: (id: string) =>
    request<RawShopping>(ORDER_ENDPOINTS.dispatch(id), { body: { mode: 'broadcast' } }),

  widen: (id: string) => request<RawShopping>(ORDER_ENDPOINTS.widen(id), { body: { scope: 'wide' } }),

  itemAction: (id: string, itemId: string, action: 'cancel' | 'ask_again') =>
    request<RawShopping>(ORDER_ENDPOINTS.item(id, itemId), { body: { action } }),

  // Sends the request to the pharmacies the patient chose; each one then sends its price.
  dispatch: (id: string, choice: PharmacyChoice) =>
    request<{ requests: RawOrder[] }>(ORDER_ENDPOINTS.dispatch(id), { body: choice }),

  quote: (id: string, pharmacyIds: string[]) =>
    request<ShoppingQuote>(ORDER_ENDPOINTS.quote(id), { body: { pharmacyIds } }),
};
