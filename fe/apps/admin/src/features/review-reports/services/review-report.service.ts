import type {
  PaginatedReviewReportResponse,
  ReviewReport,
} from "../types/review-report";
import {adminApi} from "@/shared/lib/axios.ts";

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
    const response = await adminApi.get(`/review-reports/${id}`);
    return response.data.data;
  },

  resolve: async (id: number): Promise<ReviewReport> => {
    const response = await adminApi.patch(`/review-reports/${id}/resolve`);
    return response.data.data;
  },

  dismiss: async (id: number): Promise<ReviewReport> => {
    const response = await adminApi.patch(`/review-reports/${id}/dismiss`);
    return response.data.data;
  },

  remove: async (id: number): Promise<void> => {
    await adminApi.delete(`/review-reports/${id}`);
  },
};
