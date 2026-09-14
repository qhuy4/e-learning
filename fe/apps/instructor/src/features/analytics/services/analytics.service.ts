import { instructorApi } from "@/shared/lib/axios";
import type { CourseAnalytics, DateRange } from "../types/analytics";

export const analyticsService = {
  async getCourseAnalytics(
    courseId: string,
    dateRange: DateRange,
    startDate?: string,
    endDate?: string,
  ) {
    const response = await instructorApi.get(
      `/analytics/courses/${courseId}`,
      { params: { dateRange, startDate, endDate } }
    );
    return response.data;
  },
};
