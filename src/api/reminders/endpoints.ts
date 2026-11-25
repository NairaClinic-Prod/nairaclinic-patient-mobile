// Every reminder endpoint the app uses.
export const REMINDER_ENDPOINTS = {
  mine: '/notifications/reminders/me',
  create: '/notifications/reminders',
  cancel: (id: string) => `/notifications/reminders/${encodeURIComponent(id)}/cancel`,
} as const;
