import type { NotificationRow } from './types';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const at = (offset: number) => new Date(Date.now() + offset).toISOString();

export const DUMMY_NOTIFICATIONS: NotificationRow[] = [
  {
    id: 'n1',
    title: 'Your consultation starts soon',
    message: 'Dr. Adebayo Okonkwo is ready. Join your video call now.',
    type: 'Appointment',
    createdAt: at(-5 * 60_000),
    isRead: false,
    path: '/home',
  },
  {
    id: 'n2',
    title: 'Pharmacy sent you a price',
    message: 'HealthPlus Lekki replied with prices for your request REQ-1A7QZ.',
    type: 'Order',
    createdAt: at(-2 * HOUR),
    isRead: false,
    path: '/orders',
  },
  {
    id: 'n3',
    title: 'Lab results are ready',
    message: 'Your full blood count from Lifecare Diagnostics has been released.',
    type: 'Lab',
    createdAt: at(-1 * DAY),
    isRead: true,
    path: '/records',
  },
  {
    id: 'n4',
    title: 'Time to take Amoxicillin',
    message: '1 capsule, 3 times daily. Finish the full course.',
    type: 'Reminder',
    createdAt: at(-1 * DAY - 3 * HOUR),
    isRead: true,
    path: '/reminders',
  },
  {
    id: 'n5',
    title: 'Your order is ready to collect',
    message: 'Show code 4827 at HealthPlus Lekki.',
    type: 'Order',
    createdAt: at(-2 * DAY),
    isRead: true,
    path: '/orders',
  },
  {
    id: 'n6',
    title: 'Wallet top-up received',
    message: '₦10,000 has been added to your wallet.',
    type: 'Wallet',
    createdAt: at(-3 * DAY),
    isRead: true,
  },
];
