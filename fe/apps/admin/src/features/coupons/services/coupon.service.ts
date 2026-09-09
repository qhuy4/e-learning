import type { AdminCoupon, AdminCouponDetail } from "@/features/coupons/types/coupon";
import { adminApi } from "@/shared/lib/axios.ts";

export const couponService = {
  async list(params: {
    page?: number;
    limit?: number;
    keyword?: string;
    scope?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ data: AdminCoupon[]; meta: any }> {
    const response = await adminApi.get("/coupons", { params });
    return response.data;
  },

  async getById(id: string): Promise<AdminCouponDetail> {
    const response = await adminApi.get(`/coupons/${id}`);
    return response.data.data;
  },

  async create(data: {
    code: string;
    discountType: string;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    usageLimitPerUser?: number;
    scope?: string;
    couponOwnerType?: string;
    validFrom?: string;
    validUntil?: string;
    description?: string;
    courseIds?: string[];
  }): Promise<AdminCouponDetail> {
    const response = await adminApi.post("/coupons", data);
    return response.data.data;
  },

  async update(
    id: string,
    data: {
      code?: string;
      discountType?: string;
      discountValue?: number;
      minOrderAmount?: number;
      maxDiscountAmount?: number;
      usageLimit?: number;
      usageLimitPerUser?: number;
      scope?: string;
      validFrom?: string;
      validUntil?: string;
      description?: string;
      courseIds?: string[];
    },
  ): Promise<AdminCouponDetail> {
    const response = await adminApi.patch(`/coupons/${id}`, data);
    return response.data.data;
  },

  async toggleActive(id: string): Promise<AdminCouponDetail> {
    const response = await adminApi.patch(`/coupons/${id}/toggle`);
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await adminApi.delete(`/coupons/${id}`);
  },
};
