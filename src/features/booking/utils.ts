import { BOOKING_DAYS } from './constants';
import type { RawSlot } from '@/api/booking';
import type { DayOfSlots, Slot } from './types';

const CLOCK = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});
const LONG_DAY = new Intl.DateTimeFormat('en-NG', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const WEEKDAY = new Intl.DateTimeFormat('en-NG', { weekday: 'short' });
const MONTH = new Intl.DateTimeFormat('en-NG', { month: 'short' });
const NAIRA = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

export const naira = (amount: number) => NAIRA.format(amount);
export const clock = (iso: string) => CLOCK.format(new Date(iso));
export const longDay = (date: Date) => LONG_DAY.format(date);
export const dayParts = (date: Date) => ({
  weekday: WEEKDAY.format(date).toUpperCase(),
  day: String(date.getDate()),
  month: MONTH.format(date),
});
export const timeRange = (slot: Slot) => `${clock(slot.startsAt)} – ${clock(slot.endsAt)}`;

// Gets the slug out of a pasted doctor link, or null if it is not one.
export function slugFromLink(input: string) {
  return input.trim().match(/\/doctor\/([A-Za-z0-9_-]+)/)?.[1] ?? null;
}

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// Joins back-to-back slots into start times for the chosen length (the website does the same).
function windowsOf(slots: RawSlot[], durationMins: number): Slot[] {
  const asSlot = (slot: RawSlot): Slot => ({
    id: slot.id,
    startsAt: slot.startAtUtc,
    endsAt: slot.endAtUtc,
  });
  if (!durationMins || durationMins <= 0 || !slots.length) return slots.map(asSlot);
  const length = Math.min(
    ...slots.map((slot) =>
      Math.round((new Date(slot.endAtUtc).getTime() - new Date(slot.startAtUtc).getTime()) / 60000)
    )
  );
  if (!Number.isFinite(length) || length <= 0) return slots.map(asSlot);

  const need = Math.ceil(durationMins / length);
  const lengthMs = length * 60000;
  const byStart = new Map<number, RawSlot>();
  for (const slot of slots) {
    const ms = new Date(slot.startAtUtc).getTime();
    if (Number.isFinite(ms)) byStart.set(ms, slot);
  }
  const starts = [...byStart.keys()].sort((a, b) => a - b);
  const runs: number[][] = [];
  let run: number[] = [];
  for (const ms of starts) {
    if (!run.length || ms - run[run.length - 1]! === lengthMs) run.push(ms);
    else {
      runs.push(run);
      run = [ms];
    }
  }
  if (run.length) runs.push(run);

  const out: Slot[] = [];
  for (const group of runs) {
    for (let i = 0; i + need <= group.length; i += need) {
      const start = group[i]!;
      const first = byStart.get(start)!;
      out.push({
        id: first.id,
        startsAt: first.startAtUtc,
        endsAt: new Date(start + durationMins * 60000).toISOString(),
      });
    }
  }
  return out;
}

// A doctor's real open times grouped by day, for the chosen visit length.
export function daysFromSlots(
  slots: RawSlot[],
  durationMins: number,
  earliest: number
): DayOfSlots[] {
  const byDay = new Map<string, Slot[]>();
  for (const slot of windowsOf(slots, durationMins)
    .filter((item) => new Date(item.startsAt).getTime() >= earliest)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
    const key = dayKey(new Date(slot.startsAt));
    byDay.set(key, [...(byDay.get(key) ?? []), slot]);
  }
  return [...byDay.entries()].map(([key, list]) => {
    const date = new Date(list[0]!.startsAt);
    date.setHours(0, 0, 0, 0);
    return { key, date, slots: list };
  });
}

export type Timing = { minWaitMinutes: number; stepMinutes: number };

// What the backend uses until it has answered: at least an hour away, rounded up to the quarter hour.
export const DEFAULT_TIMING: Timing = { minWaitMinutes: 60, stepMinutes: 15 };

// The earliest time a booking can start: at least the minimum wait away, rounded up to the step.
// Same rule as the backend, so 1:11 becomes 2:15, 1:14 becomes 2:15 and 1:16 becomes 2:30.
export function earliestBookingAt(now: number, timing: Timing): number {
  const step = Math.max(1, timing.stepMinutes) * 60_000;
  const wholeMinute = Math.floor(now / 60_000) * 60_000;
  return Math.ceil((wholeMinute + Math.max(0, timing.minWaitMinutes) * 60_000) / step) * step;
}

const REQUEST_START_HOUR = 8;
const REQUEST_END_HOUR = 22;

// For "find me a doctor" there is no doctor yet, so, like the website, any time from 8am to 10pm over
// the next seven days that is not before the earliest booking time.
export function requestDays(durationMins: number, earliest: number): DayOfSlots[] {
  const days: DayOfSlots[] = [];
  for (let offset = 0; offset < BOOKING_DAYS; offset += 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    const end = new Date(date);
    end.setHours(REQUEST_END_HOUR, 0, 0, 0);
    const slots: Slot[] = [];
    const start = new Date(date);
    start.setHours(REQUEST_START_HOUR, 0, 0, 0);
    for (
      let at = start.getTime();
      at + durationMins * 60_000 <= end.getTime();
      at += durationMins * 60_000
    ) {
      if (at < earliest) continue;
      slots.push({
        id: `${dayKey(date)}-${at}`,
        startsAt: new Date(at).toISOString(),
        endsAt: new Date(at + durationMins * 60_000).toISOString(),
      });
    }
    if (slots.length) days.push({ key: dayKey(date), date, slots });
  }
  return days;
}

export function ageFrom(dateOfBirth: string | null | undefined) {
  if (!dateOfBirth) return null;
  const born = new Date(dateOfBirth);
  if (Number.isNaN(born.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) age -= 1;
  return age >= 0 && age <= 150 ? age : null;
}
