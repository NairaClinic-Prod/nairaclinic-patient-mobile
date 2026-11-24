import type { ReminderRepeat } from './types';

export const REPEAT_LABEL: Record<ReminderRepeat, string> = {
  daily: 'Every day',
  days: 'Selected days',
  once: 'Once',
};

export const REPEAT_OPTIONS: { value: ReminderRepeat; label: string }[] = [
  { value: 'daily', label: 'Every day' },
  { value: 'days', label: 'Specific days' },
  { value: 'once', label: 'Once' },
];

export const WEEKDAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

export const MAX_TIMES = 6;
