import { instructorApi } from "@/shared/lib/axios";

export interface GetQuestionsParams {
  page?: number;
  limit?: number;
  courseId?: number;
  status?: number;
  keyword?: string;
}

export const qaService = {
  async getInstructorQuestions(params: GetQuestionsParams) {
    const response = await instructorApi.get("/course-questions", { params });
    return response.data;
  },

  async getQuestionDetail(id: number) {
    const response = await instructorApi.get(`/course-questions/${id}`);
    return response.data;
  },

  async createAnswer(questionId: number, content: string) {
    const response = await instructorApi.post(`/course-questions/${questionId}/answers`, { content });
    return response.data;
  },

  async updateQuestionStatus(id: number, status: number) {
    const response = await instructorApi.patch(`/course-questions/${id}/status`, { status });
    return response.data;
  },
};
