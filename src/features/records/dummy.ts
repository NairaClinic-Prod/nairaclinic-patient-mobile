import type { Reading, SugarTiming } from './types';

const DAY = 86_400_000;
const at = (days: number, hour: number) => {
  const date = new Date(Date.now() - days * DAY);
  date.setHours(hour, 15, 0, 0);
  return date.toISOString();
};

const BP: [number, number, number, number, number][] = [
  [0, 8, 124, 82, 76],
  [1, 20, 130, 85, 80],
  [2, 8, 128, 84, 78],
  [4, 8, 136, 88, 82],
  [5, 21, 122, 80, 74],
  [7, 8, 126, 83, 77],
  [9, 8, 132, 86, 79],
  [11, 20, 120, 79, 72],
];

const SUGAR: [number, number, number, SugarTiming][] = [
  [0, 7, 96, 'fasting'],
  [1, 14, 138, 'after_meal'],
  [3, 7, 102, 'fasting'],
  [4, 22, 118, 'bedtime'],
  [6, 7, 99, 'fasting'],
  [8, 13, 142, 'after_meal'],
  [10, 7, 94, 'fasting'],
];

export const DUMMY_READINGS: Reading[] = [
  ...BP.map(([days, hour, systolic, diastolic, pulse], index): Reading => ({
    id: `bp-${index}`,
    kind: 'bp',
    atUtc: at(days, hour),
    systolic,
    diastolic,
    pulse,
  })),
  ...SUGAR.map(([days, hour, sugar, timing], index): Reading => ({
    id: `sugar-${index}`,
    kind: 'sugar',
    atUtc: at(days, hour),
    sugar,
    timing,
  })),
];
