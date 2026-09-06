import { instructorApi } from "@/shared/lib/axios";

export const courseService = {
  async getCourses(params: {
    page?: number;
    limit?: number;
    level?: number;
    keyword?: string;
    status?: number;
  }) {
    const response = await instructorApi.get("/courses", { params });
    return response.data;
  },

  async getCourseById(id: string) {
    const response = await instructorApi.get(`/courses/${id}`);
    return response.data;
  },

  async createCourse(data: FormData) {
    const response = await instructorApi.post("/courses", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async updateCourse(id: string, data: FormData) {
    const response = await instructorApi.patch(`/courses/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async deleteCourse(id: string) {
    const response = await instructorApi.delete(`/courses/${id}`);
    return response.data;
  },
};
