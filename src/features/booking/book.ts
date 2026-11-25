import {
  bookingApi,
  type BookingPhoto,
  type DoctorBooking,
  type SmartBooking,
} from '@/api/booking';
import { pay, PAYMENT_ENDPOINTS } from '@/api/payments';
import { ApiError } from '@/api/client';
import { queryClient } from '@/api/query-client';
import { homeKeys } from '@/api/home';

// A message a patient can act on, for every way booking and paying can fail.
export function bookingMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return "Can't reach NairaClinic. Check your connection and try again.";
    if (
      error.status === 409 ||
      /no longer available|not available|already (booked|taken)/i.test(error.message)
    ) {
      return 'That time was just taken. Please pick another time.';
    }
    if (error.status === 402 || error.code === 'CARD_DECLINED') {
      return `${error.message} Try another card, or pay with your wallet or Paystack.`;
    }
    if (/too soon/i.test(error.message))
      return 'That time is too soon. Please choose a later time.';
    if (error.status === 401) return 'Your session ended. Please log in again.';
    if (error.status >= 500)
      return 'Something went wrong on our side. Please try again in a moment.';
    return error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

const MIME: Record<string, string> = { png: 'image/png', heic: 'image/heic', webp: 'image/webp' };

export function toPhotos(uris: string[]): BookingPhoto[] {
  return uris.map((uri, index) => {
    const ext = uri.split('?')[0]?.split('.').pop()?.toLowerCase() ?? 'jpg';
    return {
      uri,
      name: `symptom-${index + 1}.${ext === 'jpeg' ? 'jpg' : ext}`,
      type: MIME[ext] ?? 'image/jpeg',
    };
  });
}

export type PayPlan = {
  promoCode?: string;
  paymentMethodId?: string;
  // Set when the visit is covered by a doctor plan the patient already has.
  subscriptionId?: string;
};

export type BookingResult =
  | { status: 'booked'; consultationId: string }
  | { status: 'unpaid'; consultationId: string; message: string };

const refreshAfterBooking = () => {
  queryClient.invalidateQueries({ queryKey: homeKeys.dashboard });
  queryClient.invalidateQueries({ queryKey: ['booking', 'slots'] });
};

// Pays for a booking that already exists. It can be called again with the same consultation after a failure.
export async function payForBooking(consultationId: string, plan: PayPlan): Promise<BookingResult> {
  if (plan.subscriptionId) {
    await bookingApi.reserveIncludedVisit(plan.subscriptionId, consultationId);
    refreshAfterBooking();
    return { status: 'booked', consultationId };
  }
  const outcome = await pay({
    endpoint: PAYMENT_ENDPOINTS.consultation,
    body: {
      consultationId,
      ...(plan.promoCode ? { promoCode: plan.promoCode } : {}),
      ...(plan.paymentMethodId ? { paymentMethodId: plan.paymentMethodId } : {}),
    },
    callbackQuery: { consultationId },
  });
  if (!outcome.paid) return { status: 'unpaid', consultationId, message: outcome.message };
  refreshAfterBooking();
  return { status: 'booked', consultationId };
}

export const bookDoctorVisit = (booking: DoctorBooking) => bookingApi.createConsultation(booking);
export const sendSmartRequest = (booking: SmartBooking) => bookingApi.createSmartRequest(booking);
