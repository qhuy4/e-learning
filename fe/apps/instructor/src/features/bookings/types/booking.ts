export type BookingStatus = 0 | 1 | 2;

export type MeetingRoomStatus = "WAITING" | "ACTIVE" | "ENDED";

export interface MeetingRoomInfo {
  id: number;
  roomId: string;
  status: MeetingRoomStatus;
  startedAt: string | null;
  endedAt: string | null;
}

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
  hourlyRate: number;
  totalAmount: number;
  paymentStatus: 0 | 1 | 2;
  notes: string | null;
  meetingRoomId: number | null;
  meetingRoom: MeetingRoomInfo | null;
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

export const BookingStatusValue = {
  CANCELLED: 0,
  PENDING: 1,
  CONFIRMED: 2,
} as const;

export const BOOKING_STATUS_LABELS: Record<number, string> = {
  0: "Đã hủy",
  1: "Chờ xác nhận",
  2: "Đã xác nhận",
};

export const BOOKING_PAYMENT_STATUS_LABELS: Record<number, string> = {
  0: "Thanh toán thất bại",
  1: "Chờ thanh toán",
  2: "Đã thanh toán",
};

export const BOOKING_STATUS_CLASSES: Record<number, string> = {
  0: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  1: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  2: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export const BOOKING_ENDED_LABEL = "Đã kết thúc";
export const BOOKING_ENDED_CLASS =
  "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";

export const MEETING_ROOM_STATUS_LABELS: Record<MeetingRoomStatus, string> = {
  WAITING: "Chờ bắt đầu",
  ACTIVE: "Đang diễn ra",
  ENDED: "Đã kết thúc",
};

export const MEETING_ROOM_STATUS_CLASSES: Record<MeetingRoomStatus, string> = {
  WAITING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  ACTIVE: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  ENDED: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
};

export function isBookingEnded(
  booking: Pick<Booking, "bookingDate" | "endTime" | "status">,
): boolean {
  if (booking.status !== BookingStatusValue.CONFIRMED) return false;
  const endAt = new Date(`${booking.bookingDate}T${booking.endTime}`);
  return Date.now() >= endAt.getTime();
}

export function getBookingStatusBadge(
  booking: Pick<Booking, "bookingDate" | "endTime" | "status"> & Partial<Pick<Booking, "paymentStatus">>,
): { label: string; className: string } {
  if (booking.status === BookingStatusValue.PENDING && booking.paymentStatus === 1) {
    return { label: "Chờ thanh toán", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" };
  }
  if (isBookingEnded(booking)) {
    return { label: BOOKING_ENDED_LABEL, className: BOOKING_ENDED_CLASS };
  }
  return {
    label: BOOKING_STATUS_LABELS[booking.status] ?? "—",
    className: BOOKING_STATUS_CLASSES[booking.status] ?? "",
  };
}
