const id = (value: string) => encodeURIComponent(value);

// Every pharmacy order endpoint the app uses.
export const ORDER_ENDPOINTS = {
  orders: '/patient/me/pharmacy-requests',
  cancelOrder: (orderId: string) => `/patient/me/pharmacy-requests/${id(orderId)}/cancel`,
  deliveryTracking: (reference: string) => `/deliveries/${id(reference)}`,
  requests: '/patient/me/pharmacy-shopping-requests',
  request: (requestId: string) => `/patient/me/pharmacy-shopping-requests/${id(requestId)}`,
  dispatch: (requestId: string) => `/patient/me/pharmacy-shopping-requests/${id(requestId)}/dispatch`,
  quote: (requestId: string) => `/patient/me/pharmacy-shopping-requests/${id(requestId)}/quote`,
  cancelRequest: (requestId: string) => `/patient/me/pharmacy-shopping-requests/${id(requestId)}/cancel`,
  widen: (requestId: string) => `/patient/me/pharmacy-shopping-requests/${id(requestId)}/widen`,
  item: (requestId: string, itemId: string) =>
    `/patient/me/pharmacy-shopping-requests/${id(requestId)}/items/${id(itemId)}`,
} as const;
