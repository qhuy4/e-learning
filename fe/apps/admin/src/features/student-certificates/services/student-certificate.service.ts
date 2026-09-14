import type {
  PaginatedCertificateResponse,
  Certificate,
} from "../types/student-certificate";
import { adminApi } from "@/shared/lib/axios.ts";

export const studentCertificateService = {
  list: async (params: {
    page: number;
    limit: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PaginatedCertificateResponse> => {
    const response = await adminApi.get<PaginatedCertificateResponse>("/certificates", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Certificate> => {
    const response = await adminApi.get(`/certificates/${id}`);
    return response.data.data;
  },
};
