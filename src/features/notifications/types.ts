export type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
  path?: string;
};
