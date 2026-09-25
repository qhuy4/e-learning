import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  Mail,
  User,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { Card, CardContent } from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  useBookingDetail,
  useUpdateBookingStatus,
} from "@/features/bookings/hooks/use-bookings";
import {
  BookingStatusValue,
  MEETING_ROOM_STATUS_CLASSES,
  MEETING_ROOM_STATUS_LABELS,
  getBookingStatusBadge,
  isBookingEnded,
} from "@/features/bookings/types/booking";
import { getErrorMessage } from "@/shared/utils/error";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookingId = Number(id);
  const { data: booking, isLoading } = useBookingDetail(bookingId);
  const updateStatus = useUpdateBookingStatus();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = () => {
    updateStatus.mutate(
      { id: bookingId, status: BookingStatusValue.CONFIRMED },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          toast.success("Đã xác nhận buổi đặt lịch");
        },
        onError: (err) => {
          setConfirmOpen(false);
          toast.error(getErrorMessage(err));
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy buổi đặt lịch.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/bookings")}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  const canConfirm = booking.status === BookingStatusValue.PENDING;
  const hasEnded = isBookingEnded(booking);
  const canJoin =
    booking.status === BookingStatusValue.CONFIRMED &&
    booking.meetingRoomId != null &&
    !hasEnded;
  const statusBadge = getBookingStatusBadge(booking);
  const room = booking.meetingRoom;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate("/bookings")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Chi tiết đặt lịch</h1>
            <p className="text-sm text-muted-foreground">
              Buổi học 1:1 với {booking.studentName}
            </p>
          </div>
          <Badge variant="outline" className={`${statusBadge.className} border-0`}>
            {statusBadge.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {canConfirm && (
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={updateStatus.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Xác nhận
            </Button>
          )}
          {canJoin && (
            <Button
              className="bg-[#F38181] text-white hover:bg-[#e56d6d]"
              onClick={() => navigate(`/meeting/${booking.meetingRoomId}`)}
            >
              <Video className="h-4 w-4 mr-1" /> Vào lớp học
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Học viên
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Họ tên</p>
                <p className="font-medium">{booking.studentName}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> Email
                </p>
                <p className="font-medium">{booking.studentEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Lịch học
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Ngày</p>
                <p className="font-medium">
                  {new Date(booking.bookingDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Khung giờ
                </p>
                <p className="font-medium">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Ghi chú</p>
                <p className="font-medium">{booking.notes || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Ngày tạo</p>
                <p className="font-medium">
                  {new Date(booking.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Video className="h-4 w-4" />
            Phòng học
          </h3>
          {room ? (
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Mã phòng</p>
                <p className="font-medium">{room.roomId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Trạng thái phòng</p>
                <Badge
                  variant="outline"
                  className={`${MEETING_ROOM_STATUS_CLASSES[room.status] ?? ""} border-0`}
                >
                  {MEETING_ROOM_STATUS_LABELS[room.status] ?? "—"}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Bắt đầu lúc</p>
                <p className="font-medium">
                  {room.startedAt
                    ? new Date(room.startedAt).toLocaleString("vi-VN")
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Kết thúc lúc</p>
                <p className="font-medium">
                  {room.endedAt
                    ? new Date(room.endedAt).toLocaleString("vi-VN")
                    : "—"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa tạo phòng học. Phòng được tạo khi đặt lịch được xác nhận.
            </p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        variant="default"
        title="Xác nhận đặt lịch"
        description={`Bạn có chắc chắn muốn xác nhận buổi học với ${booking.studentName} lúc ${booking.startTime}?`}
        confirmLabel="Xác nhận"
        cancelLabel="Hủy"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
