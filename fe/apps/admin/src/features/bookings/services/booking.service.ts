import type { PaginatedBookingResponse, Booking } from "../types/booking";
import { adminApi } from "@/shared/lib/axios.ts";

export const bookingService = {
  list: async (params: {
    page: number;
    limit: number;
    keyword?: string;
    instructorId?: number;
    studentId?: number;
    status?: number;
    bookingDate?: string;
  }): Promise<PaginatedBookingResponse> => {
    const response = await adminApi.get<PaginatedBookingResponse>("/bookings", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Booking> => {
    const response = await adminApi.get(`/bookings/${id}`);
    return response.data.data;
  },

  updateStatus: async (id: number, status: number): Promise<Booking> => {
    const response = await adminApi.patch(`/bookings/${id}/status`, { status });
    return response.data.data;
  },

  remove: async (id: number): Promise<void> => {
    await adminApi.delete(`/bookings/${id}`);
  },
};
