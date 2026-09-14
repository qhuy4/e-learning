import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { premiumSubscriptionService } from "@/features/premium-subscriptions/services/premium-subscription.service";

export const premiumSubscriptionKeys = {
  all: ["premiumSubscriptions"] as const,
  lists: () => [...premiumSubscriptionKeys.all, "list"] as const,
  list: (page: number, limit: number, status?: number, keyword?: string) =>
    [...premiumSubscriptionKeys.lists(), { page, limit, status, keyword }] as const,
  details: () => [...premiumSubscriptionKeys.all, "detail"] as const,
  detail: (id: number) => [...premiumSubscriptionKeys.details(), id] as const,
};

export function usePremiumSubscriptions(
  page: number,
  limit: number,
  status?: number,
  keyword?: string,
) {
  return useQuery({
    queryKey: premiumSubscriptionKeys.list(page, limit, status, keyword),
    queryFn: () => premiumSubscriptionService.list({ page, limit, status, keyword }),
  });
}

export function usePremiumSubscription(id: number) {
  return useQuery({
    queryKey: premiumSubscriptionKeys.detail(id),
    queryFn: () => premiumSubscriptionService.getById(id),
    enabled: !!id,
  });
}

export function useUpdatePremiumSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { startedAt?: string; expiredAt?: string; status?: number } }) =>
      premiumSubscriptionService.update(id, data),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: premiumSubscriptionKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: premiumSubscriptionKeys.detail(id) });
    },
  });
}

export function useDeletePremiumSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => premiumSubscriptionService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: premiumSubscriptionKeys.lists() });
    },
  });
}
