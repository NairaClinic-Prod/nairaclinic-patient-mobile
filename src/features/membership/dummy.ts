import type { CurrentPlan, MembershipTier } from './types';

const DAY = 86_400_000;
const at = (offset: number) => new Date(Date.now() + offset).toISOString();

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

export const DUMMY_CURRENT_PLAN: CurrentPlan = {
  tierId: 't-plus',
  includedVisits: 4,
  usedVisits: 2,
  activeUntil: at(17 * DAY),
  renewalCancelled: false,
};
