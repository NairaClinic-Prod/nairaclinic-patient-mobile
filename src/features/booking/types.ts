export type { DoctorProfile } from '@/api/booking';

export type ConsultKind = 'video' | 'in_person';

export type Rate = {
  durationMins: number;
  amountNgn: number;
  label?: string | null;
};

export type Slot = {
  id: string;
  startsAt: string;
  endsAt: string;
};

export type DayOfSlots = {
  key: string;
  date: Date;
  slots: Slot[];
};

export type PayChoice = 'wallet' | 'card' | 'paystack';

// What the doctor cards need, so a search result and a full profile look the same.
export type DoctorSummary = {
  slug: string;
  name: string;
  specialty: string;
  languages: string[];
  rating?: number | null;
  isOnline?: boolean;
};
