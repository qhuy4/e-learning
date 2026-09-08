import type { PaginationResponse } from "@/shared/types/pagination";
import type { AdminOrder, AdminOrderDetail } from "@/features/orders/types/admin-order";
import { adminApi } from "@/shared/lib/axios";

export const adminOrderService = {
  async getOrders(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: string,
    status?: string,
  ): Promise<PaginationResponse<AdminOrder>> {
    const response = await adminApi.get<PaginationResponse<AdminOrder>>("/orders/", {
      params: {
        page,
        limit,
        ...(search && { keyword: search }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
        ...(status !== undefined && { status }),
      },
    });
    return response.data;
  },

  async getOrder(id: string): Promise<AdminOrderDetail> {
    const response = await adminApi.get<{ data: AdminOrderDetail }>(`/orders/${id}`);
    return response.data.data;
  },

  async updateOrderStatus(id: string, status: string): Promise<AdminOrderDetail> {
    const response = await adminApi.patch<{ data: AdminOrderDetail }>(`/orders/${id}/status`, null, {
      params: { status },
    });
    return response.data.data;
  },
};
