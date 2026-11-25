import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ApiError } from '../http';
import { queryClient } from '../query-client';
import { request } from '../client';
import { PAYMENT_ENDPOINTS, paymentCallback, refreshPayments, settlePayment } from '../payments';
import type { PaymentReply, PayOutcome } from '../payments';
import { labsApi } from './endpoint.api';
import {
  toBooking,
  toBranchDetail,
  toLabOption,
  toLabPackageDetail,
  toLabPackageListItem,
  toPackageLabOption,
  toPackageSummary,
  toPriceRequest,
} from './map';
import type {
  LabBooking,
  LabCollection,
  LabPoint,
  LabQuoteInput,
  NewLabBooking,
  NewPriceRequest,
} from './type';

export * from './type';
export { labsApi } from './endpoint.api';
export { LAB_ENDPOINTS } from './endpoints';
export {
  toBooking,
  toBranchDetail,
  toLabOption,
  toLabPackageDetail,
  toLabPackageListItem,
  toPackageLabOption,
  toPackageSummary,
  toPriceRequest,
} from './map';

export const labKeys = {
  all: ['labs'] as const,
  bookings: ['labs', 'bookings'] as const,
  booking: (id: string) => ['labs', 'booking', id] as const,
  requests: ['labs', 'requests'] as const,
  slots: (branchId: string, date: string, collection: string) =>
    ['labs', 'slots', branchId, date, collection] as const,
  quote: (key: string) => ['labs', 'quote', key] as const,
  search: (key: string) => ['labs', 'search', key] as const,
  packages: ['labs', 'packages'] as const,
  labPackages: (key: string) => ['labs', 'lab-packages', key] as const,
  labPackage: (id: string) => ['labs', 'lab-package', id] as const,
  packageLabs: (key: string) => ['labs', 'package-labs', key] as const,
  branch: (id: string) => ['labs', 'branch', id] as const,
};

const OPEN_BOOKING = [
  'pending_payment',
  'booked',
  'collector_assigned',
  'checked_in',
  'in_progress',
];

export const useLabBookingsQuery = () =>
  useQuery({
    queryKey: labKeys.bookings,
    queryFn: async () => (await labsApi.bookings()).map(toBooking),
    refetchInterval: (query) =>
      query.state.data?.some((booking) => OPEN_BOOKING.includes(booking.status)) ? 60_000 : false,
  });

export const useLabRequestsQuery = () =>
  useQuery({
    queryKey: labKeys.requests,
    queryFn: async () => (await labsApi.requests()).map(toPriceRequest),
    refetchInterval: 60_000,
  });

export const useLabSearch = (input: {
  tests: string[];
  area: string;
  collection: LabCollection;
  point?: LabPoint | null;
}) =>
  useQuery({
    queryKey: labKeys.search(JSON.stringify(input)),
    queryFn: async () => (await labsApi.search(input)).map(toLabOption),
    enabled: input.tests.length > 0,
    staleTime: 30_000,
  });

export const useLabSlots = (branchId: string | null, date: string, collection: LabCollection) =>
  useQuery({
    queryKey: labKeys.slots(branchId ?? '', date, collection),
    queryFn: () => labsApi.slots(branchId as string, date, collection),
    enabled: Boolean(branchId),
    staleTime: 15_000,
  });

export const useLabQuote = (input: LabQuoteInput | null) =>
  useQuery({
    queryKey: labKeys.quote(JSON.stringify(input)),
    queryFn: () => labsApi.quote(input as LabQuoteInput),
    enabled: Boolean(input),
    retry: false,
    staleTime: 10_000,
    // Switching sample collection or result delivery re-prices on the server, but the step
    // keeps showing the last price until the new one lands.
    placeholderData: keepPreviousData,
  });

export const usePlatformPackages = () =>
  useQuery({
    queryKey: labKeys.packages,
    queryFn: () => labsApi.platformPackages(),
    staleTime: 60_000,
  });

export const useLabPackageList = (input: {
  kind?: 'lab' | 'procedure';
  area?: string;
  point?: LabPoint | null;
}) =>
  useQuery({
    queryKey: labKeys.labPackages(JSON.stringify(input)),
    queryFn: async () => (await labsApi.labPackages(input)).map(toLabPackageListItem),
    staleTime: 30_000,
  });

export const useLabPackage = (id: string | null) =>
  useQuery({
    queryKey: labKeys.labPackage(id ?? ''),
    queryFn: () => labsApi.labPackage(id as string).then(toLabPackageDetail),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

export const usePackageLabs = (
  packageId: string | null,
  input: { area?: string; collection?: LabCollection; point?: LabPoint | null }
) =>
  useQuery({
    queryKey: labKeys.packageLabs(JSON.stringify({ packageId, ...input })),
    queryFn: async () =>
      (await labsApi.packageLabs(packageId as string, input)).map(toPackageLabOption),
    enabled: Boolean(packageId),
    staleTime: 30_000,
  });

export const useBranchDetail = (id: string | null) =>
  useQuery({
    queryKey: labKeys.branch(id ?? ''),
    queryFn: () => labsApi.branch(id as string).then(toBranchDetail),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

export const useLabBooking = (id: string | null) =>
  useQuery({
    queryKey: labKeys.booking(id ?? ''),
    queryFn: () => labsApi.booking(id as string).then(toBooking),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data && OPEN_BOOKING.includes(query.state.data.status) ? 60_000 : false,
  });

export async function refreshLabs() {
  await Promise.all([queryClient.invalidateQueries({ queryKey: labKeys.all }), refreshPayments()]);
}

// Starts a booking, then pays it (wallet first, then card). A booking that was started but not paid
// is paid again instead of starting a second one.
export async function bookAndPay(
  body: NewLabBooking,
  started?: LabBooking | null
): Promise<{ booking: LabBooking; outcome: PayOutcome }> {
  const booking = started ?? toBooking(await labsApi.createBooking(body));
  const outcome = await payBooking(booking.id);
  await refreshLabs();
  return { booking, outcome };
}

export async function payBooking(id: string): Promise<PayOutcome> {
  const reply = await request<{ payment: PaymentReply }>(PAYMENT_ENDPOINTS.labBooking(id), {
    body: { callbackUrl: paymentCallback({ booking: id }) },
    timeoutMs: 45_000,
  });
  const outcome = await settlePayment(
    reply.payment,
    "We couldn't confirm your payment yet. Open the booking again in a moment."
  );
  await refreshLabs();
  return outcome;
}

export async function cancelBooking(id: string, reason?: string) {
  await labsApi.cancelBooking(id, reason);
  await refreshLabs();
}

export async function askLabs(input: NewPriceRequest) {
  const rows = await labsApi.createRequest(input);
  const mapped = rows.map(toPriceRequest);
  queryClient.setQueryData(labKeys.requests, mapped);
  return mapped;
}

export async function closeRequest(id: string) {
  const rows = await labsApi.closeRequest(id);
  queryClient.setQueryData(labKeys.requests, rows.map(toPriceRequest));
}

export const isBookingError = (error: unknown) => error instanceof ApiError;
