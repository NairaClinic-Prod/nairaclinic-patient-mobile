import { request } from '../client';
import { NOTIFICATION_ENDPOINTS } from './endpoints';
import type { NotificationsReply } from './type';

const query = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  const text = search.toString();
  return text ? `?${text}` : '';
};

export const notificationsApi = {
  list: (input: { page?: number; limit?: number; unreadOnly?: boolean } = {}) =>
    request<NotificationsReply>(
      `${NOTIFICATION_ENDPOINTS.me}${query({
        page: input.page ? String(input.page) : undefined,
        limit: input.limit ? String(input.limit) : undefined,
        unreadOnly: input.unreadOnly ? 'true' : undefined,
      })}`
    ),

  markRead: (id: string) =>
    request<{ success: boolean }>(NOTIFICATION_ENDPOINTS.read(id), { body: {} }),

  markAllRead: () => request<{ success: boolean }>(NOTIFICATION_ENDPOINTS.readAll, { body: {} }),

  registerDevice: (body: { token: string; platform: 'ios' | 'android' }) =>
    request<{ success: boolean }>(NOTIFICATION_ENDPOINTS.registerDevice, { body }),
};
