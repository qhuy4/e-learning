import type { CourseQuestion } from "@/features/questions/types/question";
import { adminApi } from "@/shared/lib/axios.ts";

export const questionService = {
  async list(params: {
    page?: number;
    limit?: number;
    courseId?: number;
    status?: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ data: CourseQuestion[]; meta: any }> {
    const response = await adminApi.get("/course-questions", { params });
    return response.data;
  },

  async getById(id: string): Promise<CourseQuestion> {
    const response = await adminApi.get(`/course-questions/${id}`);
    return response.data.data;
  },

  async updateStatus(id: string, status: number): Promise<CourseQuestion> {
    const response = await adminApi.patch(`/course-questions/${id}/status`, { status });
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await adminApi.delete(`/course-questions/${id}`);
  },

  async updateAnswerStatus(id: string, status: number): Promise<void> {
    await adminApi.patch(`/course-questions/answers/${id}/status`, { status });
  },

  async removeAnswer(id: string): Promise<void> {
    await adminApi.delete(`/course-questions/answers/${id}`);
  },
};
