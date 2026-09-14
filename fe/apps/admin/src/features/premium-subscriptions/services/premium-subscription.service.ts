import type {
  PaginatedSubscriptionResponse,
  PremiumSubscription,
} from "../types/premium-subscription";
import { adminApi } from "@/shared/lib/axios.ts";

export const premiumSubscriptionService = {
  list: async (params: {
    page: number;
    limit: number;
    status?: number;
    keyword?: string;
  }): Promise<PaginatedSubscriptionResponse> => {
    const response = await adminApi.get<PaginatedSubscriptionResponse>("/premium-subscriptions", { params });
    return response.data;
  },

  getById: async (id: number): Promise<PremiumSubscription> => {
    const response = await adminApi.get(`/premium-subscriptions/${id}`);
    return response.data.data;
  },

  update: async (id: number, data: { startedAt?: string; expiredAt?: string; status?: number }): Promise<PremiumSubscription> => {
    const response = await adminApi.patch(`/premium-subscriptions/${id}`, data);
    return response.data.data;
  },

  remove: async (id: number): Promise<void> => {
    await adminApi.delete(`/premium-subscriptions/${id}`);
  },
};
