import { request } from '../client';
import { LAB_ENDPOINTS } from './endpoints';
import type {
  LabCollection,
  LabPoint,
  LabQuote,
  LabQuoteInput,
  LabSlot,
  NewLabBooking,
  NewPriceRequest,
  RawBooking,
  RawBranchDetail,
  RawLabPackageDetail,
  RawLabPackageListItem,
  RawPackageLab,
  RawPlatformPackage,
  RawRequest,
  RawSearchResult,
} from './type';

const query = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  const text = search.toString();
  return text ? `?${text}` : '';
};

const point = (value?: LabPoint | null) => ({
  lat: value?.lat.toFixed(5),
  lng: value?.lng.toFixed(5),
});

export const labsApi = {
  // Labs that can do the tests, nearest first when the patient's pin is sent.
  search: (input: {
    tests: string[];
    area: string;
    collection: LabCollection;
    point?: LabPoint | null;
  }) =>
    request<{ labs: RawSearchResult[] }>(
      `${LAB_ENDPOINTS.search}${query({
        tests: input.tests.join('|'),
        area: input.area,
        collection: input.collection,
        ...point(input.point),
      })}`
    ).then((reply) => reply.labs),

  // The checkout's options and totals always come from the server.
  quote: (input: LabQuoteInput) =>
    request<{ quote: LabQuote }>(LAB_ENDPOINTS.quote, { body: input }).then((reply) => reply.quote),

  // Platform-wide packages, bookable at any lab that covers their tests.
  platformPackages: () =>
    request<{ packages: RawPlatformPackage[] }>(LAB_ENDPOINTS.packages).then(
      (reply) => reply.packages
    ),

  // Lab-made packages, nearest first when the patient's pin or area is sent.
  labPackages: (input: { kind?: 'lab' | 'procedure'; area?: string; point?: LabPoint | null }) =>
    request<{ packages: RawLabPackageListItem[] }>(
      `${LAB_ENDPOINTS.labPackages}${query({ kind: input.kind, area: input.area, ...point(input.point) })}`
    ).then((reply) => reply.packages),

  labPackage: (id: string) => request<RawLabPackageDetail>(LAB_ENDPOINTS.labPackage(id)),

  // Approved branches whose catalogue covers every test in the package.
  packageLabs: (
    id: string,
    input: { area?: string; collection?: LabCollection; point?: LabPoint | null }
  ) =>
    request<{ labs: RawPackageLab[] }>(
      `${LAB_ENDPOINTS.packageLabs(id)}${query({ area: input.area, collection: input.collection, ...point(input.point) })}`
    ).then((reply) => reply.labs),

  // One branch with its bookable tests and packages.
  branch: (id: string) => request<RawBranchDetail>(LAB_ENDPOINTS.branch(id)),

  slots: (branchId: string, date: string, collection: LabCollection) =>
    request<{ slots: LabSlot[] }>(
      `${LAB_ENDPOINTS.slots(branchId)}${query({ date, collection })}`
    ).then((reply) => reply.slots),

  bookings: () =>
    request<{ bookings: RawBooking[] }>(LAB_ENDPOINTS.bookings).then((reply) => reply.bookings),

  booking: (id: string) =>
    request<{ booking: RawBooking }>(LAB_ENDPOINTS.booking(id)).then((reply) => reply.booking),

  // Starts an unpaid booking. The server prices it and holds the slot.
  createBooking: (body: NewLabBooking) =>
    request<{ booking: RawBooking }>(LAB_ENDPOINTS.bookings, { body }).then(
      (reply) => reply.booking
    ),

  cancelBooking: (id: string, reason?: string) =>
    request<{ booking: RawBooking }>(LAB_ENDPOINTS.cancelBooking(id), {
      body: reason ? { reason } : {},
    }),

  requests: () =>
    request<{ requests: RawRequest[] }>(LAB_ENDPOINTS.requests).then((reply) => reply.requests),

  createRequest: (input: NewPriceRequest) =>
    request<{ requests: RawRequest[] }>(LAB_ENDPOINTS.requests, {
      body: {
        area: input.area,
        collection: input.collection,
        tests: input.tests,
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        ...(input.note ? { note: input.note } : {}),
        ...(input.consultationId ? { consultationId: input.consultationId } : {}),
        ...(input.point ? { lat: input.point.lat, lng: input.point.lng } : {}),
      },
    }).then((reply) => reply.requests),

  closeRequest: (id: string) =>
    request<{ requests: RawRequest[] }>(LAB_ENDPOINTS.closeRequest(id), { body: {} }).then(
      (reply) => reply.requests
    ),
};
