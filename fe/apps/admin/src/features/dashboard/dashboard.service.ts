import { adminApi } from "@/shared/lib/axios.ts";

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalOrders: number;
  totalRevenue: number;
  pendingCertificates: number;
  revenueByMonth: { month: string; revenue: number }[];
  recentOrders: { id: number; orderCode: string; total: number; status: number; createdAt: string; userName: string }[];
  recentEnrollments: { id: number; createdAt: string; userName: string; courseTitle: string }[];
}

export const dashboardService = {
  getStats: async (params?: { from?: string; to?: string }): Promise<DashboardStats> => {
    const response = await adminApi.get("/dashboard/stats", { params });
    return response.data.data;
  },
};
