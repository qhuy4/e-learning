import type {
  RevenueSplit,
  RevenueSummary,
  InstructorPayout,
} from "@/features/earnings/types/earnings";
import { adminApi } from "@/shared/lib/axios.ts";

export const earningsService = {
  async listRevenueSplits(params: {
    page?: number;
    limit?: number;
    instructorId?: number;
    courseId?: number;
    payoutStatus?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ data: RevenueSplit[]; meta: any }> {
    const response = await adminApi.get("/revenue", { params });
    return response.data;
  },

  async getRevenueSummary(params: {
    instructorId?: number;
  }): Promise<RevenueSummary> {
    const response = await adminApi.get("/revenue/summary", { params });
    return response.data;
  },

  async listPayouts(params: {
    page?: number;
    limit?: number;
    instructorId?: number;
    status?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ data: InstructorPayout[]; meta: any }> {
    const response = await adminApi.get("/payouts", { params });
    return response.data;
  },

  async getPayoutById(id: string): Promise<InstructorPayout> {
    const response = await adminApi.get(`/payouts/${id}`);
    return response.data.data;
  },

  async createPayout(data: {
    instructorId: number;
    payoutAccountId: number;
    periodStart: string;
    periodEnd: string;
  }): Promise<InstructorPayout> {
    const response = await adminApi.post("/payouts", data);
    return response.data.data;
  },

  async updatePayoutStatus(
    id: string,
    data: {
      status: number;
      transactionRef?: string;
      paidAt?: string;
      note?: string;
    },
  ): Promise<InstructorPayout> {
    const response = await adminApi.patch(`/payouts/${id}`, data);
    return response.data.data;
  },
};
