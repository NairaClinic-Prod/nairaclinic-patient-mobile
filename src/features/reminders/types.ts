export type ReminderKind = 'medication' | 'lab' | 'general';
export type ReminderRepeat = 'daily' | 'days' | 'once';
export type ReminderState = 'active' | 'paused' | 'ended';

export type ReminderMeta = {
  kind: ReminderKind;
  title: string;
  dose: string;
  frequency: string;
  sourceLine: string;
  times: string[];
  repeat: ReminderRepeat;
  weekdays: number[];
  startDate: string;
  endDate: string;
  note: string;
};

export type ReminderGroup = {
  id: string;
  meta: ReminderMeta;
  paused: boolean;
};

export type ReminderDraft = ReminderMeta;
