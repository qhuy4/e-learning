import type {
  PaginatedNotificationResponse,
  Notification,
} from "../types/notification";
import { adminApi } from "@/shared/lib/axios.ts";

export const notificationService = {
  list: async (params: {
    page: number;
    limit: number;
    type?: string;
    isRead?: boolean;
    keyword?: string;
  }): Promise<PaginatedNotificationResponse> => {
    const response = await adminApi.get<PaginatedNotificationResponse>("/notifications", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Notification> => {
    const response = await adminApi.get(`/notifications/${id}`);
    return response.data.data;
  },

  unreadCount: async (): Promise<{ count: number }> => {
    const response = await adminApi.get("/notifications/unread-count");
    return response.data.data;
  },

  markAsRead: async (id: string): Promise<{ id: string; isRead: boolean; readAt: string }> => {
    const response = await adminApi.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const response = await adminApi.patch("/notifications/read-all");
    return response.data.data;
  },

  remove: async (id: string): Promise<{ id: string }> => {
    const response = await adminApi.delete(`/notifications/${id}`);
    return response.data.data;
  },
};
