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

  slots: (branchId: string, date: string, collection: LabCollection) =>
    request<{ slots: LabSlot[] }>(
      `${LAB_ENDPOINTS.slots(branchId)}${query({ date, collection })}`
    ).then((reply) => reply.slots),

  bookings: () =>
    request<{ bookings: RawBooking[] }>(LAB_ENDPOINTS.bookings).then((reply) => reply.bookings),

  // Starts an unpaid booking. The server prices it and holds the slot.
  createBooking: (body: NewLabBooking) =>
    request<{ booking: RawBooking }>(LAB_ENDPOINTS.bookings, { body }).then((reply) => reply.booking),

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
        ...(input.point ? { lat: input.point.lat, lng: input.point.lng } : {}),
      },
    }).then((reply) => reply.requests),

  closeRequest: (id: string) =>
    request<{ requests: RawRequest[] }>(LAB_ENDPOINTS.closeRequest(id), { body: {} }).then(
      (reply) => reply.requests
    ),
};
