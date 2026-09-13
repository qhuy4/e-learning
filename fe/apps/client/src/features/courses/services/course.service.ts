import { api } from "@fe/lib/axios";
import type { Course, CourseDetail, GetCoursesParams } from "../types/course.type";
import type { CatalogCourse } from "../components/Catalog/types";

export const courseService = {
  getCourses: async (params?: GetCoursesParams): Promise<Course[]> => {
    const { data: res } = await api.get("/courses", { params });
    return res.data;
  },

  getCourseBySlug: async (slug: string): Promise<CourseDetail> => {
    const { data: res } = await api.get(`/courses/${slug}`);
    return res.data;
  },

  getCourseById: async (id: string | number): Promise<CourseDetail> => {
    const { data: res } = await api.get(`/courses/id/${id}`);
    return res.data;
  },

  previewCourse: async (token: string): Promise<CourseDetail> => {
    const { data: res } = await api.get("/courses/preview", {
      params: { token },
    });
    return res.data;
  },

  getRelatedCourses: async (slug: string, limit = 4): Promise<CatalogCourse[]> => {
    const { data: res } = await api.get(`/courses/slug/${slug}/related`, {
      params: { limit },
    });
    return res.data;
  },
};
