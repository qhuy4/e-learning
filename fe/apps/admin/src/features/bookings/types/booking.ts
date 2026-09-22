export type BookingStatus = 0 | 1 | 2 | 3;

export interface Booking {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  instructorId: number;
  instructorName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedBookingResponse {
  data: Booking[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const bookingStatusLabel: Record<BookingStatus, string> = {
  0: "Chờ xác nhận",
  1: "Đã xác nhận",
  2: "Đã hủy",
  3: "Hoàn thành",
};

export const bookingStatusColor: Record<BookingStatus, string> = {
  0: "bg-yellow-100 text-yellow-800",
  1: "bg-green-100 text-green-800",
  2: "bg-red-100 text-red-800",
  3: "bg-blue-100 text-blue-800",
};
