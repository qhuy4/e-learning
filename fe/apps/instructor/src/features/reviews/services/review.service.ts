import { instructorApi } from "@/shared/lib/axios";

export const reviewService = {
  async getCourseReviews(courseId: string, page = 1, limit = 50) {
    const response = await instructorApi.get(
      `/courses/${courseId}/reviews`,
      { params: { page, limit } },
    );
    return response.data;
  },
};
