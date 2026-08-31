import { api } from "@fe/lib/axios";
import type { Course, Section } from "../types/course.types";

export const courseService = {
  createCourse: async (data: Partial<Course>) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        key === "thumbnail"
      ) {
        return;
      }

      if (key === "benefits" && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
        return;
      }

      formData.append(key, String(value));
    });
    if (data.thumbnail instanceof File) {
      formData.append("thumbnail", data.thumbnail);
    }

    for (const [key, value] of formData.entries()) {
      console.log(
        key,
        value instanceof File
          ? {
              name: value.name,
              type: value.type,
              size: value.size,
            }
          : value,
      );
    }

    const response = await api.post("/courses", formData);

    return response.data;
  },

  getCourseById: async (id: string | number) => {
    const response = await api.get(`/courses/id/${id}`);
    return response.data;
  },

  updateCourse: async (id: string | number, data: Partial<Course>) => {
    const formData = new FormData();

    // Primitive fields to include
    const primitiveKeys = ["title", "description", "price", "level", "parentId", "status"];

    Object.entries(data).forEach(([key, value]) => {
      if (!primitiveKeys.includes(key)) return;
      if (value === undefined || value === null || value === "") return;
      formData.append(key, String(value));
    });

    // Only append thumbnail if it's a new File (not a URL)
    if (data.thumbnail instanceof File) {
      formData.append("thumbnail", data.thumbnail);
    }

    const response = await api.patch(`/courses/${id}`, formData);

    return response.data;
  },

  createSection: async (payload: { courseId: number; section: Section }) => {
    const response = await api.post(
      `/courses/${payload.courseId}/sections`,
      payload.section,
    );

    return response.data;
  },

  updateSection: async (payload: {
    courseId: number;
    sectionId: number;
    section: Partial<Section>;
  }) => {
    const response = await api.patch(
      `/courses/${payload.courseId}/sections/${payload.sectionId}`,
      payload.section,
    );

    return response.data;
  },

  deleteCourse: async (id: string | number) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  deleteSection: async (payload: { courseId: number; sectionId: number }) => {
    const response = await api.delete(
      `/courses/${payload.courseId}/sections/${payload.sectionId}`,
    );
    return response.data;
  },

  getCourses: async (params?: { page?: number; limit?: number; level?: string; keyword?: string; status?: string }) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },
};
