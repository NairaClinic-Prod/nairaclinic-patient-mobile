import type { DoctorPlan } from './types';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const at = (offset: number) => new Date(Date.now() + offset).toISOString();

export const DUMMY_DOCTOR_PLANS: DoctorPlan[] = [
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
];
