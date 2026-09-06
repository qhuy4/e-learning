import { api } from "@fe/lib/axios";

export const adminCourseService = {
  approveCourse: async (id: string | number) => {
    const response = await api.post(`/courses/${id}/approve`);
    return response.data;
  },

  rejectCourse: async (payload: { id: string | number; reason?: string }) => {
    const response = await api.post(`/courses/${payload.id}/reject`, {
      reason: payload.reason,
    });
    return response.data;
  },

  getPreviewToken: async (id: string | number): Promise<{ token: string }> => {
    const response = await api.post<{ token: string }>(
      `/courses/${id}/preview-token`,
    );
    return (response.data as any)?.data || response.data;
  },
  getCourses: async (params?: {
    page?: number;
    limit?: number;
    level?: string;
    keyword?: string;
    status?: string;
  }) => {
    const response = await api.get("/courses/admin", { params });
    return response.data;
  },
};
