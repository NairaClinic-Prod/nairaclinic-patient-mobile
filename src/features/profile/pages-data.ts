import { createStore } from '@/lib/store';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const at = (offset: number) => new Date(Date.now() + offset).toISOString();

export type WalletEntry = {
  id: string;
  direction: 'in' | 'out';
  amountKobo: number;
  title: string;
  at: string;
};

export const WALLET_COINS = 1250;

export const WALLET_HISTORY: WalletEntry[] = [
  { id: 'w1', direction: 'in', amountKobo: 1_000_000, title: 'Wallet top-up', at: at(-2 * HOUR) },
  { id: 'w2', direction: 'out', amountKobo: 580_000, title: 'Pharmacy order', at: at(-1 * DAY) },
  { id: 'w3', direction: 'out', amountKobo: 1_500_000, title: 'Consultation', at: at(-3 * DAY) },
  { id: 'w4', direction: 'in', amountKobo: 250_000, title: 'Refund', at: at(-9 * DAY) },
  { id: 'w5', direction: 'out', amountKobo: 500_000, title: 'Subscription', at: at(-12 * DAY) },
  { id: 'w6', direction: 'in', amountKobo: 2_000_000, title: 'Wallet top-up', at: at(-20 * DAY) },
];

export type PlanAudience = 'individual' | 'family' | 'enterprise';

export type MembershipTier = {
  id: string;
  audience: PlanAudience;
  name: string;
  description: string;
  priceNgn: number | null;
  priceLabel: string;
  contact: boolean;
  benefits: string[];
};

export const TIERS: MembershipTier[] = [
  {
    id: 't-free',
    audience: 'individual',
    name: 'Basic',
    description: 'Everything you need to book and keep your records.',
    priceNgn: 0,
    priceLabel: 'Free',
    contact: false,
    benefits: ['Medical records', 'Appointment booking', 'Prescription tracking'],
  },
  {
    id: 't-plus',
    audience: 'individual',
    name: 'Plus',
    description: 'Included GP visits and priority booking support.',
    priceNgn: 5000,
    priceLabel: '₦5,000 / month',
    contact: false,
    benefits: [
      '4 GP consultations a month',
      'Booking support',
      'Appointment reminders',
      'Health community',
    ],
  },
  {
    id: 't-premium',
    audience: 'individual',
    name: 'Premium',
    description: 'More visits and a care coordinator who follows up for you.',
    priceNgn: 12000,
    priceLabel: '₦12,000 / month',
    contact: false,
    benefits: [
      '8 GP consultations a month',
      'Care coordinator',
      'Medical scan sharing',
      'Everything in Plus',
    ],
  },
  {
    id: 't-family',
    audience: 'family',
    name: 'Family',
    description: 'One plan for your household, with a shared visit allowance.',
    priceNgn: 20000,
    priceLabel: '₦20,000 / month',
    contact: false,
    benefits: [
      'Up to 5 members',
      '10 shared GP consultations',
      'Household management',
      'Care coordinator',
    ],
  },
  {
    id: 't-business',
    audience: 'enterprise',
    name: 'Business',
    description: 'Care for your team, with privacy-safe reporting.',
    priceNgn: null,
    priceLabel: 'Custom pricing',
    contact: true,
    benefits: ['Employee enrolment', 'Aggregate privacy reports', 'Dedicated care coordinator'],
  },
];

export type CurrentPlan = {
  tierId: string;
  includedVisits: number;
  usedVisits: number;
  activeUntil: string;
  renewalCancelled: boolean;
};

export const membershipStore = createStore<{ current: CurrentPlan | null }>({
  current: {
    tierId: 't-plus',
    includedVisits: 4,
    usedVisits: 2,
    activeUntil: at(17 * DAY),
    renewalCancelled: false,
  },
});

export const cancelRenewal = () =>
  membershipStore.set((state) =>
    state.current ? { current: { ...state.current, renewalCancelled: true } } : state
  );

export type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
  path?: string;
};

export const notificationsStore = createStore<{ rows: NotificationRow[] }>({
  rows: [
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
  ],
});

export const markNotificationRead = (id: string) =>
  notificationsStore.set((state) => ({
    rows: state.rows.map((row) => (row.id === id ? { ...row, isRead: true } : row)),
  }));

export const markAllNotificationsRead = () =>
  notificationsStore.set((state) => ({
    rows: state.rows.map((row) => ({ ...row, isRead: true })),
  }));

export type PriceRequest = {
  id: string;
  reference: string;
  tests: string[];
  area: string;
  expiresAt: string;
  replies: { id: string; lab: string; note: string; totalKobo: number }[];
};

export const LAB_REQUESTS: PriceRequest[] = [
  {
    id: 'pr1',
    reference: 'LRQ-4D2KX',
    tests: ['Lipid profile', 'HbA1c'],
    area: 'Lekki',
    expiresAt: at(DAY),
    replies: [
      {
        id: 'r1',
        lab: 'Synlab · Victoria Island',
        note: 'Results in about 12 hours',
        totalKobo: 1_850_000,
      },
      {
        id: 'r2',
        lab: 'Lifecare Diagnostics · Lekki',
        note: 'Results in about 24 hours',
        totalKobo: 1_700_000,
      },
    ],
  },
  {
    id: 'pr2',
    reference: 'LRQ-9H3MA',
    tests: ['Vitamin D'],
    area: 'Ikoyi',
    expiresAt: at(2 * DAY),
    replies: [],
  },
];

export type DoctorPlan = {
  id: string;
  doctor: string;
  name: string;
  status: 'active' | 'ending' | 'lapsed';
  periodEnd: string;
  nextChargeKobo: number | null;
  card: string | null;
  remaining: { label: string; remaining: number; count: number }[];
};

export const doctorPlansStore = createStore<{ plans: DoctorPlan[] }>({
  plans: [
    {
      id: 'dp1',
      doctor: 'Dr. Ngozi Eze',
      name: 'Monthly asthma care',
      status: 'active',
      periodEnd: at(12 * DAY),
      nextChargeKobo: 2_500_000,
      card: 'Visa •••• 4081',
      remaining: [
        { label: 'Video consultation · 30 min', remaining: 2, count: 3 },
        { label: 'Chat follow-up', remaining: 5, count: 5 },
      ],
    },
  ],
});

export const turnOffAutoRenew = (id: string) =>
  doctorPlansStore.set((state) => ({
    plans: state.plans.map((plan) =>
      plan.id === id ? { ...plan, status: 'ending', nextChargeKobo: null } : plan
    ),
  }));
