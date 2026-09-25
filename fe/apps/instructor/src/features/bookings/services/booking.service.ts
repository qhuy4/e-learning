import { instructorApi } from "@/shared/lib/axios";
import type { Booking, PaginatedBookingResponse } from "../types/booking";

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: number;
  bookingDate?: string;
}

export const bookingService = {
  async getBookings(params: GetBookingsParams): Promise<PaginatedBookingResponse> {
    const response = await instructorApi.get("/bookings", { params });
    return response.data;
  },

  async getBookingDetail(id: number): Promise<Booking> {
    const response = await instructorApi.get(`/bookings/${id}`);
    return response.data.data;
  },

  async updateStatus(id: number, status: number): Promise<Booking> {
    const response = await instructorApi.patch(`/bookings/${id}/status`, { status });
    return response.data.data;
  },
};
