import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics.service";
import type { DateRange } from "../types/analytics";

export function useCourseAnalytics(courseId: string | undefined, dateRange: DateRange) {
  return useQuery({
    queryKey: ["course-analytics", courseId, dateRange],
    queryFn: () => analyticsService.getCourseAnalytics(courseId!, dateRange),
    enabled: !!courseId,
  });
}
