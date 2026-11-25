import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import { notificationsApi } from './endpoint.api';
import { toNotificationRow } from './map';
import type { NotificationRow } from './type';

export * from './type';
export { notificationsApi } from './endpoint.api';
export { NOTIFICATION_ENDPOINTS } from './endpoints';
export { toNotificationRow } from './map';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: ['notifications', 'list'] as const,
};

export const useNotificationsQuery = () =>
  useQuery({
    queryKey: notificationKeys.list,
    queryFn: async () =>
      (await notificationsApi.list({ limit: 50 })).notifications.map(toNotificationRow),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

export async function markNotificationRead(id: string) {
  await queryClient.cancelQueries({ queryKey: notificationKeys.list });
  const previous = queryClient.getQueryData<NotificationRow[]>(notificationKeys.list);
  queryClient.setQueryData<NotificationRow[]>(notificationKeys.list, (rows) =>
    rows?.map((row) => (row.id === id ? { ...row, isRead: true } : row))
  );
  try {
    await notificationsApi.markRead(id);
  } catch (error) {
    queryClient.setQueryData(notificationKeys.list, previous);
    throw error;
  } finally {
    queryClient.invalidateQueries({ queryKey: notificationKeys.list });
  }
}

export async function markAllNotificationsRead() {
  await queryClient.cancelQueries({ queryKey: notificationKeys.list });
  const previous = queryClient.getQueryData<NotificationRow[]>(notificationKeys.list);
  queryClient.setQueryData<NotificationRow[]>(notificationKeys.list, (rows) =>
    rows?.map((row) => ({ ...row, isRead: true }))
  );
  try {
    await notificationsApi.markAllRead();
  } catch (error) {
    queryClient.setQueryData(notificationKeys.list, previous);
    throw error;
  } finally {
    queryClient.invalidateQueries({ queryKey: notificationKeys.list });
  }
}
