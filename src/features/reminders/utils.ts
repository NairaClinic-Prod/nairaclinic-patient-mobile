import type { ReminderDraft, ReminderGroup, ReminderMeta, ReminderState } from './types';

const DAY = 86_400_000;
const WAT_OFFSET = 3_600_000;
const MAX_DAYS = 400;

const SHORT_DATE = new Intl.DateTimeFormat('en-NG', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
});
const WEEKDAY = new Intl.DateTimeFormat('en-NG', { timeZone: 'UTC', weekday: 'short' });

// Lagos is UTC+1 all year, so shifting by an hour and reading as UTC gives West Africa Time.
export function todayKey() {
  return new Date(Date.now() + WAT_OFFSET).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number) {
  return new Date(new Date(`${date}T00:00:00Z`).getTime() + days * DAY).toISOString().slice(0, 10);
}

export function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function isTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function dateLabel(date: string) {
  return SHORT_DATE.format(new Date(`${date}T12:00:00Z`));
}

export function formatNext(date: Date) {
  const wat = new Date(date.getTime() + WAT_OFFSET);
  const days =
    Math.floor((date.getTime() + WAT_OFFSET) / DAY) - Math.floor((Date.now() + WAT_OFFSET) / DAY);
  const day = days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : WEEKDAY.format(wat);
  return `${day} ${wat.toISOString().slice(11, 16)}`;
}

export function nextOccurrence(
  meta: Pick<ReminderMeta, 'startDate' | 'endDate' | 'times' | 'repeat' | 'weekdays'>,
  now = Date.now()
): Date | null {
  const start = new Date(`${meta.startDate}T00:00:00Z`).getTime();
  const last = new Date(
    `${(meta.repeat === 'once' ? meta.startDate : meta.endDate) || meta.startDate}T00:00:00Z`
  ).getTime();
  const end = Math.min(last, start + MAX_DAYS * DAY);
  let best: Date | null = null;
  for (let day = start; day <= end; day += DAY) {
    const key = new Date(day).toISOString().slice(0, 10);
    if (meta.repeat === 'days' && !meta.weekdays.includes(new Date(day).getUTCDay())) continue;
    for (const time of meta.times) {
      const at = new Date(`${key}T${time}:00+01:00`);
      if (at.getTime() > now && (!best || at < best)) best = at;
    }
  }
  return best;
}

export function stateOf(group: ReminderGroup): ReminderState {
  if (group.paused) return 'paused';
  return nextOccurrence(group.meta) ? 'active' : 'ended';
}

export function blankDraft(): ReminderDraft {
  const today = todayKey();
  return {
    kind: 'general',
    title: '',
    dose: '',
    frequency: '',
    sourceLine: '',
    times: ['08:00'],
    repeat: 'daily',
    weekdays: [],
    startDate: today,
    endDate: addDays(today, 6),
    note: '',
  };
}

export function missingFor(draft: ReminderDraft) {
  const personal = draft.kind === 'general';
  return [
    ...(personal && draft.title.trim() === '' ? ['What the reminder is for'] : []),
    ...(draft.times.length === 0 || !draft.times.every(isTime) ? ['A time for each alert'] : []),
    ...(!isDateKey(draft.startDate) ? ['A start date'] : []),
    ...(draft.repeat === 'days' && draft.weekdays.length === 0 ? ['At least one weekday'] : []),
    ...(draft.repeat !== 'once' &&
    isDateKey(draft.startDate) &&
    (!isDateKey(draft.endDate) || draft.endDate < draft.startDate)
      ? ['An end date after the start']
      : []),
  ];
}

const LONG_DATE = new Intl.DateTimeFormat('en-NG', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function longDateLabel(date: string) {
  return LONG_DATE.format(new Date(`${date}T12:00:00Z`));
}

// Every future firing inside the horizon, so a repeating phone schedule can be mirrored to the
// server as one-shot reminders (push and the calendar feed keep working with the app closed).
export function occurrencesOf(
  meta: Pick<ReminderMeta, 'startDate' | 'endDate' | 'times' | 'repeat' | 'weekdays'>,
  horizonDays = 14,
  now = Date.now()
): Date[] {
  const out: Date[] = [];
  const today = todayKey();
  for (let offset = 0; offset < horizonDays; offset++) {
    const key = addDays(today, offset);
    if (meta.repeat === 'once') {
      if (key !== meta.startDate) continue;
    } else {
      if (key < meta.startDate || key > meta.endDate) continue;
      if (
        meta.repeat === 'days' &&
        !meta.weekdays.includes(new Date(`${key}T00:00:00Z`).getUTCDay())
      )
        continue;
    }
    for (const time of meta.times) {
      if (!isTime(time)) continue;
      const at = new Date(`${key}T${time}:00+01:00`);
      if (at.getTime() > now) out.push(at);
    }
  }
  return out.sort((a, b) => a.getTime() - b.getTime());
}
