import { useQuery } from "@tanstack/react-query";
import { revenueService, type GetRevenueByCourseParams } from "../services/revenue.service";

export function useRevenueSummary() {
  return useQuery({
    queryKey: ["revenue-summary"],
    queryFn: () => revenueService.getSummary(),
  });
}

export function useRevenueByCourse(params: GetRevenueByCourseParams) {
  return useQuery({
    queryKey: ["revenue-by-course", params],
    queryFn: () => revenueService.getByCourse(params),
  });
}
