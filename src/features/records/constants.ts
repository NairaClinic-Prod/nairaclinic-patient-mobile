import type { SugarTiming } from './types';

export const TIMING_LABEL: Record<SugarTiming, string> = {
  fasting: 'Fasting',
  before_meal: 'Before a meal',
  after_meal: 'After a meal',
  random: 'Random',
  bedtime: 'Bedtime',
};

export const COLORS = {
  systolic: '#0f5c52',
  diastolic: '#c2702e',
  pulse: '#2f6fb0',
  sugar: '#0f5c52',
};

export const LIMITS = ['7', '14', '30'] as const;
export const LAB_RESULTS_SHOWN = 6;
export const RECORDS_SUBTITLE = 'Manage your health records and history';
