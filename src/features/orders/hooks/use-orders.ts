import { createStore } from '@/lib/store';
import { DUMMY_ORDERS } from '../dummy';
import type { OrderStatus } from '../types';

const store = createStore(DUMMY_ORDERS, { persist: 'orders', scope: 'account' });

export const useOrdersData = store.use;

export function cancelOrder(id: string) {
  store.set((data) => ({
    ...data,
    orders: data.orders.map((order) =>
      order.id === id ? { ...order, status: 'cancelled' as OrderStatus, cancellable: false } : order
    ),
  }));
}

export function cancelRequest(id: string) {
  store.set((data) => ({
    ...data,
    requests: data.requests.map((request) =>
      request.id === id ? { ...request, status: 'cancelled' as const } : request
    ),
  }));
}
