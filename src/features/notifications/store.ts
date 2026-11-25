import {
  markAllNotificationsRead as markAllServer,
  markNotificationRead as markServer,
  useNotificationsQuery,
  type NotificationRow,
} from '@/api/notifications';
import { createStore } from '@/lib/store';
import * as React from 'react';

export type { NotificationRow };

// The last notifications the server sent, so the list has something to show while offline.
const saved = createStore<{ rows: NotificationRow[] }>(
  { rows: [] },
  { persist: 'notifications-v2', scope: 'account' }
);

export function useNotifications() {
  const snapshot = saved.useValue();
  const query = useNotificationsQuery();
  React.useEffect(() => {
    if (query.data) saved.set({ rows: query.data });
  }, [query.data]);
  return { rows: query.data ?? snapshot.rows };
}

export const useUnreadCount = () => {
  const { rows } = useNotifications();
  return rows.filter((row) => !row.isRead).length;
};

export function markNotificationRead(id: string) {
  const previous = saved.get().rows;
  saved.set((state) => ({
    rows: state.rows.map((row) => (row.id === id ? { ...row, isRead: true } : row)),
  }));
  markServer(id).catch(() => saved.set({ rows: previous }));
}

export function markAllNotificationsRead() {
  const previous = saved.get().rows;
  saved.set((state) => ({ rows: state.rows.map((row) => ({ ...row, isRead: true })) }));
  markAllServer().catch(() => saved.set({ rows: previous }));
}
