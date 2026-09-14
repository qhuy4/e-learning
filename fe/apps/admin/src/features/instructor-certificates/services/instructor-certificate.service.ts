import type {
  PaginatedInstructorCertificateResponse,
  InstructorCertificate,
} from "../types/instructor-certificate";
import { adminApi } from "@/shared/lib/axios.ts";

export const instructorCertificateService = {
  list: async (params: {
    page: number;
    limit: number;
    status?: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PaginatedInstructorCertificateResponse> => {
    const response = await adminApi.get<PaginatedInstructorCertificateResponse>("/instructor-certificates", { params });
    return response.data;
  },

  getById: async (id: string): Promise<InstructorCertificate> => {
    const response = await adminApi.get(`/instructor-certificates/${id}`);
    return response.data.data;
  },

  approve: async (id: number): Promise<InstructorCertificate> => {
    const response = await adminApi.patch(`/instructor-certificates/${id}/approve`);
    return response.data.data;
  },

  reject: async (id: number, rejectReason: string): Promise<InstructorCertificate> => {
    const response = await adminApi.patch(`/instructor-certificates/${id}/reject`, { rejectReason });
    return response.data.data;
  },
};
