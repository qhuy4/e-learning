import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { couponService } from "@/features/coupons/services/coupon.service";

export const couponKeys = {
  all: ["coupons"] as const,
  lists: () => [...couponKeys.all, "list"] as const,
  list: (page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string, scope?: string, isActive?: boolean) =>
    [...couponKeys.lists(), { page, limit, search, sortBy, sortOrder, scope, isActive }] as const,
  details: () => [...couponKeys.all, "detail"] as const,
  detail: (id: string) => [...couponKeys.details(), id] as const,
};

export function useCoupons(
  page: number,
  limit: number,
  search?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  scope?: string,
  isActive?: boolean,
) {
  return useQuery({
    queryKey: couponKeys.list(page, limit, search, sortBy, sortOrder, scope, isActive),
    queryFn: () => couponService.list({ page, limit, keyword: search, sortBy, sortOrder, scope, isActive }),
  });
}

export function useCoupon(id: string) {
  return useQuery({
    queryKey: couponKeys.detail(id),
    queryFn: () => couponService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof couponService.create>[0]) => couponService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof couponService.update>[1] }) =>
      couponService.update(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: couponKeys.detail(variables.id) });
    },
  });
}

export function useToggleCouponActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponService.toggleActive(id),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: couponKeys.detail(variables) });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}
