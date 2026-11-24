import type { PillTone } from '@/components/shared/status-pill';
import type { LabBookingStatus, OrderStatus, OrderView } from './types';

export const VIEW_STATUSES: Record<OrderView, readonly OrderStatus[]> = {
  requests: ['new', 'quoted', 'accepted'],
  active: ['preparing', 'ready'],
  history: ['completed'],
  closed: ['declined', 'cancelled'],
};

export const VIEWS: { value: OrderView; label: string }[] = [
  { value: 'requests', label: 'Active Request' },
  { value: 'closed', label: 'Expired / closed' },
  { value: 'active', label: 'Active orders' },
  { value: 'history', label: 'Order history' },
];

export const EMPTY: Record<OrderView, { title: string; description: string }> = {
  requests: {
    title: 'No active medicine orders',
    description: 'Use an existing prescription or add one while making your order.',
  },
  closed: {
    title: 'Nothing expired or closed',
    description:
      'Requests that were declined, cancelled or got no pharmacy reply in time show up here.',
  },
  active: {
    title: 'No orders in progress',
    description: 'Once you pay for an offer, it is tracked here until you collect it.',
  },
  history: {
    title: 'No past orders yet',
    description: 'Orders you have collected show up here.',
  },
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'Waiting for a price',
  quoted: 'Price ready',
  accepted: 'Pending · paid',
  preparing: 'Accepted · being prepared',
  ready: 'Ready',
  completed: 'Collected',
  declined: 'Declined',
  cancelled: 'Cancelled',
};

export const OPEN_STATUSES: readonly OrderStatus[] = [
  'new',
  'quoted',
  'accepted',
  'preparing',
  'ready',
];

export const BOOKING_STATUS: Record<LabBookingStatus, { label: string; tone: PillTone }> = {
  pending_payment: { label: 'Awaiting payment', tone: 'pending' },
  booked: { label: 'Booked', tone: 'active' },
  collector_assigned: { label: 'Collector assigned', tone: 'active' },
  checked_in: { label: 'Checked in', tone: 'info' },
  in_progress: { label: 'Sample collected', tone: 'info' },
  completed: { label: 'Results ready', tone: 'active' },
  cancelled: { label: 'Cancelled', tone: 'inactive' },
};

export const MEDICINES_SHOWN = 3;
export const LABS_SHOWN = 5;
export const ORDERS_FOOTNOTE =
  'Making an order is free. Referral coins are applied only when you choose an offer and pay.';
