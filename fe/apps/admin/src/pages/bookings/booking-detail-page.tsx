import { useParams, useNavigate } from "react-router-dom";
import { useBooking, useUpdateBookingStatus, useDeleteBooking } from "@/features/bookings/hooks/use-bookings";
import { bookingStatusLabel, bookingStatusColor, type BookingStatus } from "@/features/bookings/types/booking";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { ArrowLeft, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: booking, isLoading } = useBooking(Number(id));
  const updateStatusMutation = useUpdateBookingStatus();
  const deleteMutation = useDeleteBooking();

  const handleStatusUpdate = (status: number) => {
    updateStatusMutation.mutate(
      { id: Number(id), status },
      {
        onSuccess: () => toast.success("Đã cập nhật trạng thái"),
        onError: () => toast.error("Không thể cập nhật trạng thái"),
      },
    );
  };

  const handleDelete = () => {
    if (!confirm("Bạn có chắc chắn muốn xóa buổi đặt lịch này?")) return;
    deleteMutation.mutate(Number(id), {
      onSuccess: () => {
        toast.success("Đã xóa buổi đặt lịch");
        navigate("/bookings");
      },
      onError: () => toast.error("Không thể xóa buổi đặt lịch"),
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Không tìm thấy buổi đặt lịch.</p>
      </div>
    );
  }

  const status = booking.status as BookingStatus;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => navigate("/bookings")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {status === 0 && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(1)}
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" /> Xác nhận
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleStatusUpdate(2)}
                disabled={updateStatusMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" /> Hủy
              </Button>
            </>
          )}
          {status === 1 && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(3)}
                disabled={updateStatusMutation.isPending}
              >
                <Clock className="h-4 w-4 mr-1" /> Hoàn thành
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleStatusUpdate(2)}
                disabled={updateStatusMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" /> Hủy
              </Button>
            </>
          )}
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4 mr-1" /> Xóa
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Buổi đặt lịch #{booking.id}</h1>
        <Badge className={bookingStatusColor[status]}>
          {bookingStatusLabel[status]}
        </Badge>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Thông tin buổi đặt lịch</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Học viên</p>
            <p className="font-medium">{booking.studentName}</p>
            <p className="text-sm text-muted-foreground">{booking.studentEmail}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Giảng viên</p>
            <p className="font-medium">{booking.instructorName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngày</p>
            <p className="font-medium">
              {new Date(booking.bookingDate).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Khung giờ</p>
            <p className="font-medium">
              {booking.startTime} - {booking.endTime}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ghi chú</p>
            <p className="font-medium">{booking.notes || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngày tạo</p>
            <p className="font-medium">
              {new Date(booking.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
            <p className="font-medium">
              {new Date(booking.updatedAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
