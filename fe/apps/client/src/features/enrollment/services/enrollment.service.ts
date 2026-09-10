import { api } from "@fe/lib/axios";

export interface Enrollment {
  id: number;
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  courseThumbnail: string | null;
  status: number;
  progress: number;
  pricePaid: number | null;
  enrolledAt: string | null;
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
  getMyEnrollments: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: Enrollment[]; meta: { total: number; totalPages: number } }> => {
    const { data: res } = await api.get("/enrollments/my", { params });
    return res.data;
  },

  checkEnrollment: async (courseSlug: string): Promise<EnrollmentCheck> => {
    const { data: res } = await api.get("/enrollments/check", {
      params: { courseSlug },
    });
    return res.data;
  },
};
