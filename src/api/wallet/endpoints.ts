// Every wallet endpoint the app uses.
export const WALLET_ENDPOINTS = {
  account: '/wallet/me',
  history: '/wallet/me/history?page=1&limit=50',
} as const;
