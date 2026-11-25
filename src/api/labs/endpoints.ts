const id = (value: string) => encodeURIComponent(value);

// Every laboratory endpoint the app uses.
export const LAB_ENDPOINTS = {
  search: '/labs/search',
  quote: '/labs/quote',
  slots: (branchId: string) => `/labs/branches/${id(branchId)}/slots`,
  bookings: '/labs/bookings',
  cancelBooking: (bookingId: string) => `/labs/bookings/${id(bookingId)}/cancel`,
  requests: '/labs/requests',
  closeRequest: (requestId: string) => `/labs/requests/${id(requestId)}/close`,
} as const;
