const id = (value: string) => encodeURIComponent(value);

// Every laboratory endpoint the app uses.
export const LAB_ENDPOINTS = {
  search: '/labs/search',
  packages: '/labs/packages',
  labPackages: '/labs/lab-packages',
  labPackage: (packageId: string) => `/labs/lab-packages/${id(packageId)}`,
  packageLabs: (packageId: string) => `/labs/packages/${id(packageId)}/labs`,
  branch: (branchId: string) => `/labs/branches/${id(branchId)}`,
  quote: '/labs/quote',
  slots: (branchId: string) => `/labs/branches/${id(branchId)}/slots`,
  bookings: '/labs/bookings',
  booking: (bookingId: string) => `/labs/bookings/${id(bookingId)}`,
  cancelBooking: (bookingId: string) => `/labs/bookings/${id(bookingId)}/cancel`,
  requests: '/labs/requests',
  closeRequest: (requestId: string) => `/labs/requests/${id(requestId)}/close`,
} as const;
