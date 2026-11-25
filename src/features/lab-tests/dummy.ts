import type { PriceRequest } from './types';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const at = (offset: number) => new Date(Date.now() + offset).toISOString();

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
