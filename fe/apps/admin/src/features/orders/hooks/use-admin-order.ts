import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminOrderService } from "@/features/orders/services/admin-order.service";

export const adminOrderKeys = {
  all: ["orders"] as const,
  lists: () => [...adminOrderKeys.all, "list"] as const,
  list: (page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string, status?: string) =>
    [...adminOrderKeys.lists(), { page, limit, search, sortBy, sortOrder, status }] as const,
  details: () => [...adminOrderKeys.all, "detail"] as const,
  detail: (id: string) => [...adminOrderKeys.details(), id] as const,
};

export function useAdminOrders(
  page: number,
  limit: number,
  search?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  status?: string,
) {
  return useQuery({
    queryKey: adminOrderKeys.list(page, limit, search, sortBy, sortOrder, status),
    queryFn: () => adminOrderService.getOrders(page, limit, search, sortBy, sortOrder, status),
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: adminOrderKeys.detail(id),
    queryFn: () => adminOrderService.getOrder(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminOrderService.updateOrderStatus(id, status),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: adminOrderKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: adminOrderKeys.detail(variables.id) });
    },
  });
}
