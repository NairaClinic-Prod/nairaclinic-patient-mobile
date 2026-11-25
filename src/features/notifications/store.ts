import { createStore } from '@/lib/store';
import { DUMMY_NOTIFICATIONS } from './dummy';

const store = createStore(
  { rows: DUMMY_NOTIFICATIONS },
  { persist: 'notifications', scope: 'account' }
);

export const useNotifications = store.use;

export const useUnreadCount = () => store.use().rows.filter((row) => !row.isRead).length;

export const markNotificationRead = (id: string) =>
  store.set((state) => ({
    rows: state.rows.map((row) => (row.id === id ? { ...row, isRead: true } : row)),
  }));

export const markAllNotificationsRead = () =>
  store.set((state) => ({
    rows: state.rows.map((row) => ({ ...row, isRead: true })),
  }));
