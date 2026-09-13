import { api } from "@fe/lib/axios";

export interface Enrollment {
  id: number;
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  courseThumbnail: string | null;
  instructorName?: string | null;
  status: number;
  progress: number;
  pricePaid: number | null;
  enrolledAt: string | null;
}

export interface GetMyEnrollmentsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface EnrollmentCheck {
  enrolled: boolean;
  enrollment: {
    id: number;
    status: number;
    progress: number;
    enrolledAt: string | null;
  } | null;
}

export const enrollmentService = {
  getMyEnrollments: async (
    params?: GetMyEnrollmentsParams,
  ): Promise<{ data: Enrollment[]; meta: { page: number; limit: number; total: number; totalPages: number } }> => {
    const { data: res } = await api.get("/enrollments/my", { params });
    // If res contains data and meta fields directly
    if (res && res.data !== undefined) {
      return {
        data: Array.isArray(res.data) ? res.data : [],
        meta: res.meta || { page: 1, limit: 10, total: Array.isArray(res.data) ? res.data.length : 0, totalPages: 1 },
      };
    }
    // Fallback if res is an array
    if (Array.isArray(res)) {
      return {
        data: res,
        meta: { page: 1, limit: 10, total: res.length, totalPages: 1 },
      };
    }
    return {
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  },

  checkEnrollment: async (courseSlug: string): Promise<EnrollmentCheck> => {
    const { data: res } = await api.get("/enrollments/check", {
      params: { courseSlug },
    });
    return res.data;
  },
};
