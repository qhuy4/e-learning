import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/features/dashboard/dashboard.service";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: (params?: { from?: string; to?: string }) => [...dashboardKeys.all, "stats", params] as const,
};

export function useDashboardStats(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: dashboardKeys.stats(params),
    queryFn: () => dashboardService.getStats(params),
  });
}
