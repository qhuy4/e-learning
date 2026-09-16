import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentsService } from "@/features/payments/services/payments.service";

export const paymentsKeys = {
  all: ["payments"] as const,
  list: (
    page: number,
    limit: number,
    orderId?: string,
    status?: number,
    gateway?: string,
    sortBy?: string,
    sortOrder?: string,
  ) =>
    [
      ...paymentsKeys.all,
      "list",
      { page, limit, orderId, status, gateway, sortBy, sortOrder },
    ] as const,
  detail: (id: string) => [...paymentsKeys.all, "detail", id] as const,
};

export function usePayments(
  page: number,
  limit: number,
  orderId?: string,
  status?: number,
  gateway?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) {
  return useQuery({
    queryKey: paymentsKeys.list(page, limit, orderId, status, gateway, sortBy, sortOrder),
    queryFn: () =>
      paymentsService.list({ page, limit, orderId, status, gateway, sortBy, sortOrder }),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentsKeys.detail(id),
    queryFn: () => paymentsService.getById(id),
    enabled: !!id,
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      paymentsService.refund(id, reason),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
      void queryClient.invalidateQueries({ queryKey: paymentsKeys.detail(variables.id) });
    },
  });
}

export function useRetryPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, gateway }: { id: string; gateway?: string }) =>
      paymentsService.retry(id, gateway),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
      void queryClient.invalidateQueries({ queryKey: paymentsKeys.detail(variables.id) });
    },
  });
}

export function useCancelPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsService.cancel(id),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
      void queryClient.invalidateQueries({ queryKey: paymentsKeys.detail(variables) });
    },
  });
}
