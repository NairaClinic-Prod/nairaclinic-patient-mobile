export type ConsultKind = 'video' | 'in_person';

export type Rate = {
  durationMins: number;
  amountNgn: number;
  label?: string;
};

export type DoctorProfile = {
  userId: string;
  slug: string;
  name: string;
  specialty: string;
  bio: string | null;
  workplace: string | null;
  languages: string[];
  rating: number | null;
  ratingCount: number;
  isOnline: boolean;
  videoRates: Rate[];
  inPersonRates: Rate[];
  practiceAddress: string | null;
  serviceFeeNgn: number;
  acceptingBookings: boolean;
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

export type PayChoice = 'wallet' | 'card';

export type Promo = {
  code: string;
  discountNgn: number;
  description: string;
};
