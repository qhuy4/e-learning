import { api } from "@fe/lib/axios";
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

  async cloneCourse(id: string) {
    const response = await instructorApi.post(`/courses/${id}/clone`);
    return response.data;
  },

  async createSection(courseId: number, section: { title: string; position?: number; description?: string }) {
    const response = await api.post(`/courses/${courseId}/sections`, section);
    return response.data;
  },

  async updateSection(courseId: number, sectionId: number, data: { title?: string; position?: number }) {
    const response = await api.patch(`/courses/${courseId}/sections/${sectionId}`, data);
    return response.data;
  },

  async deleteSection(courseId: number, sectionId: number) {
    const response = await api.delete(`/courses/${courseId}/sections/${sectionId}`);
    return response.data;
  },

  async createLesson(sectionId: number, data: FormData) {
    const response = await instructorApi.post(`/sections/${sectionId}/lessons`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async updateLesson(id: number, data: FormData) {
    const response = await instructorApi.patch(`/sections/0/lessons/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async deleteLesson(id: number) {
    const response = await instructorApi.delete(`/sections/0/lessons/${id}`);
    return response.data;
  },
};
