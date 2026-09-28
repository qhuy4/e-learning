import type { Payment, PaymentDetail } from "@/features/payments/types/payments";
import { adminApi } from "@/shared/lib/axios.ts";

export const paymentsService = {
  async list(params: {
    page?: number;
    limit?: number;
    orderId?: string;
    status?: number;
    gateway?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ data: Payment[]; meta: any }> {
    const response = await adminApi.get("/payments", { params });
    return response.data;
  },

  async getById(id: string): Promise<PaymentDetail> {
    const response = await adminApi.get(`/payments/${id}`);
    return response.data.data;
  },

  async refund(id: string, reason?: string): Promise<void> {
    await adminApi.post(`/payments/${id}/refund`, { reason });
  },

  async retry(id: string, gateway?: string): Promise<void> {
    await adminApi.post(`/payments/${id}/retry`, { gateway });
  },

  async cancel(id: string): Promise<void> {
    await adminApi.patch(`/payments/${id}/cancel`);
  },
};
