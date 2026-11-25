// The join window: opens 5 minutes before the start and closes at the end time.
export function joinWindow(
  scheduledAtUtc: string | null | undefined,
  durationMins: number | null | undefined,
  status: string,
  now = Date.now()
): 'early' | 'open' | 'closed' {
  if (!scheduledAtUtc || !['scheduled', 'in_progress'].includes(status)) return 'closed';
  const start = Date.parse(scheduledAtUtc);
  if (!Number.isFinite(start)) return 'closed';
  const end = start + Math.max(15, durationMins ?? 30) * 60_000;
  if (now >= end) return 'closed';
  return now < start - 5 * 60_000 ? 'early' : 'open';
}

export const STATUS_LABEL: Record<string, string> = {
  upcoming: 'Scheduled',
  scheduled: 'Scheduled',
  rescheduled: 'Rescheduled',
  in_progress: 'In progress',
  completed: 'Completed',
  ended: 'Ended',
  cancelled: 'Cancelled',
  missed: 'Missed',
  expired: 'Expired',
};

export const statusLabel = (value: string | null | undefined) =>
  STATUS_LABEL[value ?? ''] ?? (value ? value.replace(/_/g, ' ') : 'Scheduled');
