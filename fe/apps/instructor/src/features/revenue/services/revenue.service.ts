import { instructorApi } from "@/shared/lib/axios";

export interface GetRevenueByCourseParams {
  page?: number;
  limit?: number;
}

export const revenueService = {
  async getSummary() {
    const response = await instructorApi.get("/revenue/summary");
    return response.data;
  },

  async getByCourse(params: GetRevenueByCourseParams) {
    const response = await instructorApi.get("/revenue/by-course", { params });
    return response.data;
  },
};
