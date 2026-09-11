import { adminApi } from "@/lib/admin-api";
import type {
  PaginatedReviewReportResponse,
  ReviewReport,
} from "../types/review-report";

export const reviewReportService = {
  list: async (params: {
    page: number;
    limit: number;
    status?: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PaginatedReviewReportResponse> => {
    const response = await adminApi.get<PaginatedReviewReportResponse>("/review-reports", { params });
    return response.data;
  },

  getById: async (id: string): Promise<ReviewReport> => {
    const response = await adminApi.get<ReviewReport>(`/review-reports/${id}`);
    return response.data;
  },

  resolve: async (id: number): Promise<ReviewReport> => {
    const response = await adminApi.patch<ReviewReport>(`/review-reports/${id}/resolve`);
    return response.data;
  },

  dismiss: async (id: number): Promise<ReviewReport> => {
    const response = await adminApi.patch<ReviewReport>(`/review-reports/${id}/dismiss`);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await adminApi.delete(`/review-reports/${id}`);
  },
};
