import { api } from "@fe/lib/axios";
import type { Course,CourseDetail ,GetCoursesParams } from "../types/course.type";

export const courseService = {
  getCourses: async (params?: GetCoursesParams): Promise<Course[]> => {
    const response = await api.get("/courses", {
      params,
    });

    return response.data;
  },

    getCourseBySlug: async (slug: string): Promise<CourseDetail> => {
    const response = await api.get<CourseDetail>(`/courses/${slug}`);

    return response.data;
  },
  
  getCourseById: async (id: string | number): Promise<CourseDetail> => {
    const response = await api.get<CourseDetail>(`/courses/id/${id}`);
    return response.data;
  },

  previewCourse: async (token: string): Promise<CourseDetail> => {
    const response = await api.get<CourseDetail>("/courses/preview", {
      params: { token },
    });
    return response.data;
  },
};
