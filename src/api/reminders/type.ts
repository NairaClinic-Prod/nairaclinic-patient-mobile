// A single server reminder: one shot at one time. Repeating phone schedules are expanded
// into these so push and the calendar feed keep working when the app is closed.
export type RawReminder = {
  id: string;
  status: 'pending' | 'sent' | 'cancelled';
  dueAtUtc: string;
  title: string;
  message: string;
  dataJson: { groupId?: string; kind?: string; consultationId?: string } | null;
};

export type CreateReminderInput = {
  title: string;
  message: string;
  dueAtUtc: string;
  dataJson?: Record<string, unknown>;
};
