export interface NotificationUser {
  id: number;
  name: string;
  email?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string | null;
  body: string | null;
  data: Record<string, unknown> | null;
  notifiableType: string;
  notifiableId: number;
  isRead: boolean;
  readAt: string | null;
  actionUrl: string | null;
  entityType: string | null;
  entityId: number | null;
  createdAt: string;
  updatedAt?: string;
  user?: NotificationUser;
}

export interface PaginatedNotificationResponse {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
