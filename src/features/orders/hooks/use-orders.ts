import { useLabBookingsQuery, useLabRequestsQuery } from '@/api/labs';
import { refreshOrders, useOrdersQuery, useRequestsQuery } from '@/api/orders';
import type { OrdersData } from '../types';

const NONE: never[] = [];

export type OrdersState = OrdersData & {
  // True only on the very first load, before anything has arrived.
  loading: boolean;
  // True when there is nothing to show and the server could not be reached.
  failed: boolean;
  refresh: () => Promise<void>;
};

// The patient's pharmacy orders, open requests and lab bookings, straight from the server.
export function useOrdersData(): OrdersState {
  const orders = useOrdersQuery();
  const requests = useRequestsQuery();
  const labs = useLabBookingsQuery();
  const labRequests = useLabRequestsQuery();

  const refresh = async () => {
    await Promise.all([refreshOrders(), labs.refetch(), labRequests.refetch()]);
  };

  return {
    orders: orders.data ?? NONE,
    requests: requests.data ?? NONE,
    labBookings: labs.data ?? NONE,
    labRequests: labRequests.data ?? NONE,
    loading: orders.isPending,
    failed: orders.isError && !orders.data,
    refresh,
  };
}
