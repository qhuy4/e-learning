import { instructorApi } from "@/shared/lib/axios";
import type { CourseAnalytics, DateRange } from "../types/analytics";

export const analyticsService = {
  async getCourseAnalytics(courseId: string, dateRange: DateRange) {
    const response = await instructorApi.get(
      `/analytics/courses/${courseId}`,
      { params: { dateRange } }
    );
    return response.data;
  },
};
