export type DoctorRate = {
  type?: 'video' | 'in_person';
  durationMins: number;
  amountNgn: number;
  label?: string | null;
};

export type DoctorProfile = {
  userId: string;
  slug: string;
  name: string;
  specialty: string;
  bio: string | null;
  workplace: string | null;
  languages: string[];
  photoUrl: string | null;
  rating: number | null;
  ratingCount: number;
  isOnline: boolean;
  videoRates: DoctorRate[];
  inPersonRates: DoctorRate[];
  practiceAddress: string | null;
  serviceFeeNgn: number;
  acceptingBookings: boolean;
};

export type DoctorReply = {
  doctor: {
    userId: string;
    legalName?: string | null;
    specialty?: string | null;
    bio?: string | null;
    currentWorkPlace?: string | null;
    languages?: { language: string }[] | null;
    profilePhotoUrl?: string | null;
    bookingSlug?: string | null;
    rates?: DoctorRate[] | null;
    averageRating?: number | null;
    totalRatings?: number | null;
    practiceAddress?: { formattedAddress: string } | null;
  };
  serviceFeeNgn?: number;
  acceptingBookings?: boolean;
};

export type RawSlot = { id: string; startAtUtc: string; endAtUtc: string };

export type DoctorSearchResult = {
  id: string;
  userId: string;
  name: string;
  specialty: string | null;
  languages: string[];
  photoUrl: string | null;
  bookingSlug: string | null;
  priceKobo: number | null;
  isOnline: boolean;
  coveredByPlan: boolean;
};

export type DoctorSearchReply = {
  doctors: DoctorSearchResult[];
  total: number;
  page: number;
  totalPages: number;
};

export type BookingTiming = {
  minWaitMinutes: number;
  stepMinutes: number;
  nowUtc: string;
  earliestAtUtc: string;
};

export type CreatedConsultation = { consultationId: string };

export type PlanRow = {
  type: 'video' | 'in_person';
  durationMins: number;
  count: number;
  used: number;
  reserved: number;
  remaining: number;
};

export type DoctorPlanSubscription = {
  id: string;
  planId: string;
  doctorUserId: string;
  status: 'active' | 'ending' | 'lapsed';
  lapsed?: boolean;
  terms: { name: string };
  remaining: PlanRow[];
};

export type BookingProfile = {
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  sexAtBirth: string | null;
};

export type BookingPhoto = { uri: string; name: string; type: string };

export type BookingRequest = {
  type: 'video' | 'audio';
  durationMins: number;
  reason: string;
  symptoms: string;
  photos: BookingPhoto[];
  identity: { name: string; age: string; sex: string };
};

export type DoctorBooking = BookingRequest & {
  doctorId: string;
  slotId: string;
  inPerson: boolean;
};

export type SmartBooking = BookingRequest & { scheduledAtUtc: string };
