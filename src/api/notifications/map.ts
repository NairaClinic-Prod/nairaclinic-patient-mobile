import type { NotificationRow, RawNotification } from './type';

export function toNotificationRow(raw: RawNotification): NotificationRow {
  return {
    id: raw.id,
    title: raw.title,
    message: raw.message,
    type: raw.type,
    createdAt: raw.createdAt,
    isRead: raw.isRead,
    ...(typeof raw.dataJson?.path === 'string' && raw.dataJson.path
      ? { path: raw.dataJson.path }
      : {}),
  };
}
