import { request } from '../client';
import type {
  BookingProfile,
  BookingTiming,
  CreatedConsultation,
  DoctorBooking,
  DoctorPlanSubscription,
  DoctorProfile,
  DoctorRate,
  DoctorReply,
  DoctorSearchReply,
  RawSlot,
  SmartBooking,
  BookingRequest,
} from './type';

const DEFAULT_RATES: DoctorRate[] = [
  { durationMins: 15, amountNgn: 2500 },
  { durationMins: 30, amountNgn: 5000 },
];
export const SEARCH_PAGE_SIZE = 12;

function specialtyLabel(raw: string | null | undefined) {
  if (!raw?.trim()) return 'General practice';
  const text = raw.trim().replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function toProfile(reply: DoctorReply, slug: string): DoctorProfile {
  const { doctor, serviceFeeNgn, acceptingBookings } = reply;
  const rates = doctor.rates?.length ? doctor.rates : DEFAULT_RATES;
  const practiceAddress = doctor.practiceAddress?.formattedAddress ?? null;
  return {
    userId: doctor.userId,
    slug: doctor.bookingSlug ?? slug,
    name: doctor.legalName?.trim() || 'Doctor',
    specialty: specialtyLabel(doctor.specialty),
    bio: doctor.bio?.trim() || null,
    workplace: doctor.currentWorkPlace?.trim() || null,
    languages: (doctor.languages ?? []).map((item) => item.language),
    photoUrl: doctor.profilePhotoUrl ?? null,
    rating: doctor.averageRating ?? null,
    ratingCount: doctor.totalRatings ?? 0,
    isOnline: false,
    videoRates: rates.filter((rate) => (rate.type ?? 'video') === 'video'),
    inPersonRates: practiceAddress ? rates.filter((rate) => rate.type === 'in_person') : [],
    practiceAddress,
    serviceFeeNgn: serviceFeeNgn ?? 100,
    acceptingBookings: acceptingBookings ?? true,
  };
}

function bookingForm(booking: BookingRequest, fields: Record<string, string>) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => form.append(key, value));
  form.append('type', booking.type);
  form.append('durationMins', String(booking.durationMins));
  form.append('reason', booking.reason);
  form.append(
    'scheduledTimezone',
    (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      } catch {
        return 'UTC';
      }
    })()
  );
  booking.photos.forEach((photo) =>
    form.append('symptomImage', {
      uri: photo.uri,
      name: photo.name,
      type: photo.type,
    } as unknown as Blob)
  );
  return form;
}

const sourceDetail = (booking: BookingRequest, extra: Record<string, unknown>) =>
  JSON.stringify({
    patientName: booking.identity.name.trim(),
    patientAge: booking.identity.age,
    patientSex: booking.identity.sex,
    symptoms: booking.symptoms.trim() || undefined,
    ...extra,
  });

export const bookingApi = {
  doctor: async (slug: string): Promise<DoctorProfile> =>
    toProfile(
      await request<DoctorReply>(`/doctors/public/by-slug/${encodeURIComponent(slug)}`, {
        auth: 'none',
      }),
      slug
    ),

  slots: (slug: string) => {
    const from = new Date(Date.now() + 20 * 60_000).toISOString();
    const now = new Date();
    // Like the website: every open time from now until the end of this month.
    const to = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)
    ).toISOString();
    return request<{ slots: RawSlot[] }>(
      `/doctors/public/by-slug/${encodeURIComponent(slug)}/slots?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      { auth: 'none' }
    ).then((reply) => reply.slots);
  },

  search: (query: string) =>
    request<DoctorSearchReply>(
      `/doctors/search?page=1&limit=${SEARCH_PAGE_SIZE}&match=name&q=${encodeURIComponent(query.slice(0, 100))}`
    ),

  // The admin's minimum notice before a booking, and the step it is rounded up to.
  timing: () => request<BookingTiming>('/consultations/booking-timing', { auth: 'none' }),

  profile: () =>
    request<{ patientProfile: BookingProfile | null }>('/patient/me').then(
      (reply) => reply.patientProfile
    ),

  doctorPlans: (doctorUserId: string) =>
    request<{ subscriptions: DoctorPlanSubscription[] }>(
      `/doctor-plans/subscriptions/me?doctorUserId=${encodeURIComponent(doctorUserId)}`
    ).then((reply) => reply.subscriptions.filter((subscription) => !subscription.lapsed)),

  // Books a time with a doctor. The consultation exists unpaid until payment goes through.
  createConsultation: (booking: DoctorBooking) =>
    request<CreatedConsultation>('/consultations', {
      form: bookingForm(booking, {
        doctorId: booking.doctorId,
        slotId: booking.slotId,
        sourceKind: booking.inPerson ? 'in_person' : booking.reason || 'general',
        sourceDetail: sourceDetail(booking, { isInviteLinkBooking: true }),
      }),
      timeoutMs: 60_000,
    }),

  // Sends an open request that any matching approved doctor can accept.
  createSmartRequest: (booking: SmartBooking) =>
    request<CreatedConsultation>('/consultations/smart-request', {
      form: bookingForm(booking, {
        scheduledAtUtc: booking.scheduledAtUtc,
        timezone: (() => {
          try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
          } catch {
            return 'UTC';
          }
        })(),
        sourceKind: 'in_app_referral',
        sourceDetail: sourceDetail(booking, { requestForm: 'smart-request-page' }),
      }),
      timeoutMs: 60_000,
    }),

  reserveIncludedVisit: (subscriptionId: string, consultationId: string) =>
    request<{ alreadyPaid: boolean; visitId: string }>(
      `/doctor-plans/subscriptions/${encodeURIComponent(subscriptionId)}/visits`,
      { body: { consultationId } }
    ),
};
