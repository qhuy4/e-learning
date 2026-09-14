import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/features/notifications/services/notification.service";

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (page: number, limit: number, type?: string, isRead?: boolean, keyword?: string) =>
    [...notificationKeys.lists(), { page, limit, type, isRead, keyword }] as const,
  details: () => [...notificationKeys.all, "detail"] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
};

export function useNotifications(
  page: number,
  limit: number,
  type?: string,
  isRead?: boolean,
  keyword?: string,
) {
  return useQuery({
    queryKey: notificationKeys.list(page, limit, type, isRead, keyword),
    queryFn: () => notificationService.list({ page, limit, type, isRead, keyword }),
  });
}

export function useNotification(id: string) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationService.getById(id),
    enabled: !!id,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.unreadCount(),
    refetchInterval: 30000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: notificationKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}
