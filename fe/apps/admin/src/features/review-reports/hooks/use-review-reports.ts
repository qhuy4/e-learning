import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewReportService } from "@/features/review-reports/services/review-report.service";

export const reviewReportKeys = {
  all: ["reviewReports"] as const,
  lists: () => [...reviewReportKeys.all, "list"] as const,
  list: (page: number, limit: number, status?: number, keyword?: string, sortBy?: string, sortOrder?: string) =>
    [...reviewReportKeys.lists(), { page, limit, status, keyword, sortBy, sortOrder }] as const,
  details: () => [...reviewReportKeys.all, "detail"] as const,
  detail: (id: number) => [...reviewReportKeys.details(), id] as const,
};

export function useReviewReports(
  page: number,
  limit: number,
  status?: number,
  keyword?: string,
  sortBy?: string,
  sortOrder?: string,
) {
  return useQuery({
    queryKey: reviewReportKeys.list(page, limit, status, keyword, sortBy, sortOrder),
    queryFn: () => reviewReportService.list({ page, limit, status, keyword, sortBy, sortOrder }),
  });
}

export function useReviewReport(id: number) {
  return useQuery({
    queryKey: reviewReportKeys.detail(id),
    queryFn: () => reviewReportService.getById(String(id)),
    enabled: !!id,
  });
}

export function useResolveReviewReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewReportService.resolve(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: reviewReportKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: reviewReportKeys.detail(id) });
    },
  });
}

export function useDismissReviewReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewReportService.dismiss(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: reviewReportKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: reviewReportKeys.detail(id) });
    },
  });
}

export function useDeleteReviewReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewReportService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewReportKeys.lists() });
    },
  });
}
