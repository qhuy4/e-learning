import { instructorApi } from "@/shared/lib/axios";

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: number;
  courseId?: number;
}

export const studentService = {
  async getStudents(params: GetStudentsParams) {
    const response = await instructorApi.get("/enrollments", { params });
    return response.data;
  },

  async getStudentDetail(enrollmentId: number) {
    const response = await instructorApi.get(`/enrollments/${enrollmentId}`);
    return response.data;
  },

  async getQuizAttemptDetail(enrollmentId: number, attemptId: string) {
    const response = await instructorApi.get(`/enrollments/${enrollmentId}/quiz-attempts/${attemptId}`);
    return response.data;
  },

  async getQuizAttempts(enrollmentId: number) {
    const response = await instructorApi.get(`/enrollments/${enrollmentId}/quiz-attempts`);
    return response.data;
  },

  async getStudentProgress(enrollmentId: number) {
    const response = await instructorApi.get(`/enrollments/${enrollmentId}/progress`);
    return response.data;
  },
};
