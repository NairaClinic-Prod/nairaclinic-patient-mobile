export type ConsultationDetail = {
  consultation: {
    id: string;
    status: string;
    lifecycle?: string | null;
    canReschedule?: boolean;
    paymentStatus?: string | null;
    scheduledAtUtc: string | null;
    durationMins: number | null;
    type?: string | null;
    reason?: string | null;
    diagnosis?: string | null;
    doctorUserId?: string | null;
    rescheduleCount?: number | null;
    metaJson?: {
      source?: { kind?: string } | null;
      category?: 'general' | 'specialist' | null;
      specialty?: string | null;
      latestRescheduleReason?: string | null;
      presence?: {
        doctorJoinedAtUtc?: string | null;
        doctorLeftAtUtc?: string | null;
        doctorLastJoinedAtUtc?: string | null;
        doctorLastLeftAtUtc?: string | null;
      } | null;
    } | null;
  };
  doctor: {
    id: string;
    name: string;
    specialty: string | null;
    bookingSlug: string | null;
    practiceAddress: { formattedAddress?: string; lat?: number; lng?: number } | null;
  } | null;
};

export type RescheduleEligibility = {
  eligible: boolean;
  reason?: string;
  rescheduleCount?: number;
  maxReschedules?: number;
  earliestRescheduleAtUtc?: string;
};

export type DoctorSlot = { id: string; startAtUtc: string; endAtUtc: string };

export type RescheduleBody = {
  scheduledAtUtc: string;
  slotId: string;
  timezone: string;
  reason?: string;
};
