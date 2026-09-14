import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics.service";
import type { DateRange } from "../types/analytics";

export function useCourseAnalytics(
  courseId: string | undefined,
  dateRange: DateRange,
  startDate?: string,
  endDate?: string,
) {
  return useQuery({
    queryKey: ["course-analytics", courseId, dateRange, startDate, endDate],
    queryFn: () => analyticsService.getCourseAnalytics(courseId!, dateRange, startDate, endDate),
    enabled: !!courseId,
  });
}
