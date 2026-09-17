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

  async getStudentProgress(enrollmentId: number) {
    const response = await instructorApi.get(`/enrollments/${enrollmentId}/progress`);
    return response.data;
  },
};
