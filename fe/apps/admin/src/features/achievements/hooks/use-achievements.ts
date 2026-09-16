import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { achievementService } from "@/features/achievements/services/achievement.service";

export const achievementKeys = {
  all: ["achievements"] as const,
  lists: () => [...achievementKeys.all, "list"] as const,
  list: (page: number, limit: number, keyword?: string) =>
    [...achievementKeys.lists(), { page, limit, keyword }] as const,
  details: () => [...achievementKeys.all, "detail"] as const,
  detail: (id: number) => [...achievementKeys.details(), id] as const,
  users: (achievementId: number, page: number, limit: number, keyword?: string) =>
    [...achievementKeys.all, "users", achievementId, { page, limit, keyword }] as const,
};

export function useAchievements(page: number, limit: number, keyword?: string) {
  return useQuery({
    queryKey: achievementKeys.list(page, limit, keyword),
    queryFn: () => achievementService.list({ page, limit, keyword }),
  });
}

export function useAchievement(id: number) {
  return useQuery({
    queryKey: achievementKeys.detail(id),
    queryFn: () => achievementService.getById(id),
    enabled: !!id,
  });
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof achievementService.create>[0]) =>
      achievementService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: achievementKeys.lists() });
    },
  });
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof achievementService.update>[1] }) =>
      achievementService.update(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: achievementKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: achievementKeys.detail(variables.id) });
    },
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => achievementService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: achievementKeys.lists() });
    },
  });
}

export function useAchievementUsers(
  achievementId: number,
  page: number,
  limit: number,
  keyword?: string,
) {
  return useQuery({
    queryKey: achievementKeys.users(achievementId, page, limit, keyword),
    queryFn: () => achievementService.getUsersByAchievement(achievementId, { page, limit, keyword }),
    enabled: !!achievementId,
  });
}
