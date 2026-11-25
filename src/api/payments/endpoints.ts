const id = (value: string) => encodeURIComponent(value);

// Every payment endpoint the app uses, in one place. Pass one of these to `pay`.
export const PAYMENT_ENDPOINTS = {
  consultation: '/billing/paystack/initialize',
  consultationWithWallet: '/billing/consultations/pay-with-wallet',
  consultationWithSubscription: '/billing/consultations/pay-with-subscription',
  addCard: '/billing/payment-methods/setup',
  fileShare: '/billing/paystack/initialize-file-share',
  membership: '/billing/membership/paystack/initialize',
  membershipWithWallet: '/billing/membership/pay-with-wallet',
  credits: '/billing/credits/paystack/initialize',
  community: '/billing/community-subscriptions/paystack/initialize',
  pharmacyRequest: (requestId: string) => `/patient/me/pharmacy-requests/${id(requestId)}/pay`,
  pharmacyRequestWithWallet: (requestId: string) =>
    `/patient/me/pharmacy-requests/${id(requestId)}/pay-with-wallet`,
  doctorPlan: (planId: string) => `/doctor-plans/${id(planId)}/checkout`,
  doctorPlanWithWallet: (planId: string) => `/doctor-plans/${id(planId)}/checkout-with-wallet`,
  verify: '/billing/paystack/verify',
  wallet: '/wallet/me',
  walletHistory: '/wallet/me/history?page=1&limit=50',
  methods: '/billing/payment-methods',
  methodDefault: (methodId: string) => `/billing/payment-methods/${id(methodId)}/default`,
  method: (methodId: string) => `/billing/payment-methods/${id(methodId)}`,
} as const;
