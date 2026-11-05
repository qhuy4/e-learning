import type {
  InstructorApplicationStatus,
  PendingInstructorProfile,
  ReviewedCertificateOcrInput,
} from "@/features/instructors/type/pending-instructor.ts";
import type {PaginationResponse} from "@/shared/types/pagination.ts";
import {adminApi} from "@/shared/lib/axios.ts";
import type {Instructor} from "@/features/instructors/type/instructor.ts";



export const adminInstructorService = {
  getPendingProfiles: async (
    status?: InstructorApplicationStatus,
  ): Promise<PendingInstructorProfile[]> => {
    const response = await adminApi.get("/instructor-applications", {
      params: { limit: 100, ...(status ? { status } : {}) },
    });
    const res = response.data?.data ?? response.data;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  },

  getApplication: async (id: number): Promise<PendingInstructorProfile> => {
    const response = await adminApi.get(`/instructor-applications/${id}`);
    return response.data?.data ?? response.data;
  },

  approveApplication: async (
    id: number,
    certificateTags?: Record<string, string[]>,
  ) => {
    const response = await adminApi.patch(
      `/instructor-applications/${id}/approve`,
      { certificateTags },
    );
    return response.data?.data ?? response.data;
  },

  reviewCertificate: async (
    applicationId: number,
    certificateId: number,
    status: "APPROVED" | "REJECTED",
    reason?: string,
    ocrData?: ReviewedCertificateOcrInput,
  ) => {
    const response = await adminApi.patch(
      `/instructor-applications/${applicationId}/certificates/${certificateId}/review`,
      { status, reason, ocrData },
    );
    return response.data?.data ?? response.data;
  },

  rejectApplication: async (id: number, reason: string) => {
    const response = await adminApi.patch(
      `/instructor-applications/${id}/reject`,
      { reason },
    );
    return response.data?.data ?? response.data;
  },

  requestInformation: async (id: number, reason: string) => {
    const response = await adminApi.patch(
      `/instructor-applications/${id}/request-information`,
      { reason },
    );
    return response.data?.data ?? response.data;
  },

  getCertificateDownloadUrl: async (certificateId: number) => {
    const response = await adminApi.get(
      `/instructor-applications/certificates/${certificateId}/download-url`,
    );
    return response.data?.data ?? response.data;
  },

  async getInstructors(page: number,
      limit: number,
      search?: string,
      sortBy?: string,
      sortOrder?: string,
  ): Promise<PaginationResponse<Instructor>> {
    const response = await adminApi.get<PaginationResponse<Instructor>>("/instructors/", {
      params: {
        page,
        limit,
        ...(search && {search}),
        ...(sortBy && {sortBy}),
        ...(sortOrder && {sortOrder}),
      }
    });
    return response.data;
  },

  async getInstructor(id: number): Promise<Instructor> {
    const response = await adminApi.get<{data: Instructor}>(`/instructors/${id}`);
    return response.data.data;
  },

  async updateInstructor(id: number, data: {
    name?: string;
    email?: string;
    status?: string;
    headline?: string | null;
    bio?: string | null;
    websiteUrl?: string | null;
    socialLinks?: Record<string, string> | null;
  }): Promise<Instructor> {
    const response = await adminApi.patch<{data: Instructor}>(`/instructors/${id}`, data);
    return response.data.data;
  },
};

