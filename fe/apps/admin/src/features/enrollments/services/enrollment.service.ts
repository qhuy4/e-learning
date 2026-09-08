import type { AdminEnrollment, AdminEnrollmentDetail } from "../types/enrollment";
import { adminApi } from "@/shared/lib/axios.ts";

export const enrollmentService = {
  async list(params: {
    page?: number;
    limit?: number;
    keyword?: string;
    status?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ data: AdminEnrollment[]; meta: any }> {
    const response = await adminApi.get("/enrollments", { params });
    return response.data;
  },

  async getById(id: string): Promise<AdminEnrollmentDetail> {
    const response = await adminApi.get(`/enrollments/${id}`);
    return response.data.data;
  },
};
