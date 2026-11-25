// Every notification endpoint the app uses.
export const NOTIFICATION_ENDPOINTS = {
  me: '/notifications/me',
  read: (id: string) => `/notifications/me/${encodeURIComponent(id)}/read`,
  readAll: '/notifications/me/read-all',
  registerDevice: '/notifications/register-device',
} as const;
