import { BOOKING_DAYS } from './constants';
import { DUMMY_DOCTORS, DUMMY_PROMOS } from './dummy';
import type { DayOfSlots, DoctorProfile, Promo, Slot } from './types';

const CLOCK = new Intl.DateTimeFormat('en-NG', { hour: 'numeric', minute: '2-digit' });
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

export const findDoctor = (slug: string): DoctorProfile | undefined =>
  DUMMY_DOCTORS.find((doctor) => doctor.slug === slug);

export function searchDoctors(query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return DUMMY_DOCTORS.filter((doctor) =>
    words.every((word) => doctor.name.toLowerCase().includes(word))
  );
}

export function findPromo(code: string): Promo | undefined {
  return DUMMY_PROMOS.find((promo) => promo.code === code.trim().toUpperCase());
}

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// A doctor's open times for the next week: 9am to 5pm, back to back for the chosen length. Sundays are off and a few times are already taken.
export function openDays(durationMins: number, seed: string): DayOfSlots[] {
  const now = Date.now();
  const days: DayOfSlots[] = [];
  for (let offset = 0; offset < BOOKING_DAYS; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);
    if (date.getDay() === 0) continue;
    const slots: Slot[] = [];
    for (
      let minute = 9 * 60, index = 0;
      minute + durationMins <= 17 * 60;
      minute += durationMins, index += 1
    ) {
      const start = new Date(date);
      start.setHours(0, minute, 0, 0);
      const taken = (seed.length + offset * 3 + index) % 4 === 0;
      if (taken || start.getTime() < now + 30 * 60_000) continue;
      slots.push({
        id: `${dayKey(date)}-${minute}`,
        startsAt: start.toISOString(),
        endsAt: new Date(start.getTime() + durationMins * 60_000).toISOString(),
      });
    }
    if (slots.length) days.push({ key: dayKey(date), date, slots });
  }
  return days;
}
