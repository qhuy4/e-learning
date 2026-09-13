import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { earningsService } from "@/features/earnings/services/earnings.service";

export const earningsKeys = {
  all: ["earnings"] as const,
  revenueSplits: () => [...earningsKeys.all, "revenue-splits"] as const,
  revenueSplitList: (
    page: number,
    limit: number,
    instructorId?: number,
    courseId?: number,
    payoutStatus?: string,
    sortBy?: string,
    sortOrder?: string,
  ) =>
    [
      ...earningsKeys.revenueSplits(),
      { page, limit, instructorId, courseId, payoutStatus, sortBy, sortOrder },
    ] as const,
  revenueSummary: (instructorId?: number) =>
    [...earningsKeys.all, "revenue-summary", { instructorId }] as const,
  payouts: () => [...earningsKeys.all, "payouts"] as const,
  payoutList: (
    page: number,
    limit: number,
    instructorId?: number,
    status?: number,
    sortBy?: string,
    sortOrder?: string,
  ) =>
    [
      ...earningsKeys.payouts(),
      { page, limit, instructorId, status, sortBy, sortOrder },
    ] as const,
  payoutDetail: (id: string) => [...earningsKeys.payouts(), id] as const,
};

export function useRevenueSplits(
  page: number,
  limit: number,
  instructorId?: number,
  courseId?: number,
  payoutStatus?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) {
  return useQuery({
    queryKey: earningsKeys.revenueSplitList(page, limit, instructorId, courseId, payoutStatus, sortBy, sortOrder),
    queryFn: () =>
      earningsService.listRevenueSplits({
        page,
        limit,
        instructorId,
        courseId,
        payoutStatus,
        sortBy,
        sortOrder,
      }),
  });
}

export function useRevenueSummary(instructorId?: number) {
  return useQuery({
    queryKey: earningsKeys.revenueSummary(instructorId),
    queryFn: () => earningsService.getRevenueSummary({ instructorId }),
  });
}

export function usePayouts(
  page: number,
  limit: number,
  instructorId?: number,
  status?: number,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) {
  return useQuery({
    queryKey: earningsKeys.payoutList(page, limit, instructorId, status, sortBy, sortOrder),
    queryFn: () =>
      earningsService.listPayouts({
        page,
        limit,
        instructorId,
        status,
        sortBy,
        sortOrder,
      }),
  });
}

export function usePayout(id: string) {
  return useQuery({
    queryKey: earningsKeys.payoutDetail(id),
    queryFn: () => earningsService.getPayoutById(id),
    enabled: !!id,
  });
}

export function useCreatePayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof earningsService.createPayout>[0]) =>
      earningsService.createPayout(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: earningsKeys.payouts() });
      void queryClient.invalidateQueries({ queryKey: earningsKeys.revenueSplits() });
    },
  });
}

export function useUpdatePayoutStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof earningsService.updatePayoutStatus>[1] }) =>
      earningsService.updatePayoutStatus(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: earningsKeys.payouts() });
      void queryClient.invalidateQueries({ queryKey: earningsKeys.payoutDetail(variables.id) });
    },
  });
}
