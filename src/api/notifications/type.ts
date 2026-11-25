// A notification as the server sends it. The deep link the row opens lives in dataJson when the
// sender set one.
export type RawNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  dataJson: { path?: string } | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationsReply = {
  notifications: RawNotification[];
  total: number;
  page: number;
  totalPages: number;
};

export type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
  path?: string;
};
