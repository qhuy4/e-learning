import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/axios";

export interface JoinMeetingRoomResponse {
    token: string;
    roomName: string;
    serverUrl: string;
    endsAt: string;
}

export interface Booking {
    id: number;
    studentId?: number;
    studentName?: string;
    instructorId: number;
    instructorName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: number;
    notes: string | null;
    meetingRoomId: number | null;
}

export const BOOKING_STATUS_LABELS: Record<number, string> = {
    0: "Đã hủy",
    1: "Chờ xác nhận",
    2: "Đã xác nhận",
};

export const BOOKING_STATUS_CLASSES: Record<number, string> = {
    0: "bg-red-100 text-red-700",
    1: "bg-amber-100 text-amber-800",
    2: "bg-emerald-100 text-emerald-700",
};

export type BookingPhase = "cancelled" | "upcoming" | "completed";

export function bookingEnd(booking: Booking): Date {
    return new Date(`${booking.bookingDate.slice(0, 10)}T${booking.endTime}`);
}

export function getBookingPhase(
    booking: Booking,
    now: Date = new Date(),
): BookingPhase {
    if (booking.status === 0) return "cancelled";
    return now >= bookingEnd(booking) ? "completed" : "upcoming";
}

export function getPhaseBadge(
    booking: Booking,
    now: Date = new Date(),
): { label: string; className: string } {
    const phase = getBookingPhase(booking, now);
    if (phase === "cancelled") {
        return { label: BOOKING_STATUS_LABELS[0], className: BOOKING_STATUS_CLASSES[0] };
    }
    if (phase === "completed") {
        return { label: "Đã hoàn thành", className: "bg-emerald-100 text-emerald-700" };
    }
    if (booking.status === 1) {
        return { label: BOOKING_STATUS_LABELS[1], className: BOOKING_STATUS_CLASSES[1] };
    }
    return { label: "Sắp diễn ra", className: "bg-[#EAFFD0] text-[#146a5f]" };
}

export function isBookingJoinable(
    booking: Booking,
    now: Date = new Date(),
): boolean {
    return (
        booking.status === 2 &&
        booking.meetingRoomId != null &&
        getBookingPhase(booking, now) === "upcoming"
    );
}

export function bookingDurationMinutes(booking: Booking): number {
    const [sh, sm] = booking.startTime.split(":").map(Number);
    const [eh, em] = booking.endTime.split(":").map(Number);
    return eh * 60 + em - (sh * 60 + sm);
}

export function useMyBookings(userId?: number) {
    return useQuery({
        queryKey: ["booking-history", userId],
        queryFn: async () => {
            const res = await api.get("/admin/bookings", {
                params: { page: 1, limit: 100, studentId: userId! },
            });
            return res.data.data as { data: Booking[] };
        },
        enabled: !!userId,
        retry: 1,
    });
}

export async function joinMeetingRoom(
    meetingRoomId: number,
): Promise<JoinMeetingRoomResponse> {
    const { data } = await api.post<{
        data: JoinMeetingRoomResponse;
    }>(`/meeting/${meetingRoomId}/join`);

    return data.data;
}
