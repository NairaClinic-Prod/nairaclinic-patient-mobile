import type { Reading, SugarUnit } from './types';

const MGDL_PER_MMOL = 18.016;

export const toUnit = (mgdl: number, unit: SugarUnit) =>
  unit === 'mg/dL' ? Math.round(mgdl) : Math.round((mgdl / MGDL_PER_MMOL) * 10) / 10;

export const fromUnit = (value: number, unit: SugarUnit) =>
  unit === 'mg/dL' ? value : Math.round(value * MGDL_PER_MMOL);

const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const STAMP = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const DATE_ONLY = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const TIME_ONLY = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export const dateOnlyLabel = (iso: string) => DATE_ONLY.format(new Date(iso));
export const timeOnlyLabel = (iso: string) => TIME_ONLY.format(new Date(iso));

export const dayLabel = (iso: string) => DAY.format(new Date(iso));
export const stampLabel = (iso: string) => STAMP.format(new Date(iso));

const pad = (value: number) => String(value).padStart(2, '0');

export const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const localTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const toIso = (dateKey: string, time: string) =>
  new Date(`${dateKey}T${time}:00`).toISOString();

export const newReadingId = () =>
  `r-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const byNewest = (a: Reading, b: Reading) => b.atUtc.localeCompare(a.atUtc);
