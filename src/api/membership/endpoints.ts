// Every membership endpoint the app uses.
export const MEMBERSHIP_ENDPOINTS = {
  plans: '/subscriptions/plans',
  me: '/subscriptions/me',
  quote: '/subscriptions/quote',
  checkout: '/subscriptions/checkout',
  cancelRenewal: '/subscriptions/me/cancel',
  resume: '/subscriptions/me/resume',
} as const;
