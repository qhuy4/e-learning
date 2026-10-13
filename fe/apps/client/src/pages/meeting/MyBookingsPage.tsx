import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { History, Video } from "lucide-react";
import { api } from "@/shared/lib/axios";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { Card, CardContent } from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import {
  BOOKING_STATUS_CLASSES,
  BOOKING_STATUS_LABELS,
  type Booking,
} from "./booking.service";

export const MyBookingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      const res = await api.get("/admin/bookings", {
        params: { page: 1, limit: 50, studentId: user!.id },
      });
      return res.data.data as { data: Booking[] };
    },
    enabled: !!user?.id,
    retry: 1,
  });

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">Vui lòng đăng nhập để xem lịch đặt.</p>
          <Button className="mt-4" onClick={() => navigate("/student/login")}>
            Đăng nhập
          </Button>
        </div>
      </main>
    );
  }

  const bookings = data?.data ?? [];

  return (
    <main className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lịch đặt của tôi</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Các buổi học 1:1 sắp tới và đã qua với huấn luyện viên của bạn
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => navigate("/profile?tab=history")}
          >
            <History className="h-4 w-4 mr-1.5" />
            Lịch sử đặt lịch
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Chưa có lịch đặt nào. Hãy tìm mentor để bắt đầu.
              <div className="mt-4">
                <Button onClick={() => navigate("/mentors")}>Tìm mentor</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{b.instructorName}</p>
                      <Badge
                        variant="outline"
                        className={`${BOOKING_STATUS_CLASSES[b.status] ?? ""} border-0`}
                      >
                        {BOOKING_STATUS_LABELS[b.status] ?? "—"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(b.bookingDate).toLocaleDateString("vi-VN")} ·{" "}
                      {b.startTime}–{b.endTime}
                    </p>
                    {b.notes && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {b.notes}
                      </p>
                    )}
                  </div>
                  {b.status === 2 && b.meetingRoomId != null && (
                    <Button
                      className="rounded-full bg-[#F38181] text-white hover:bg-[#e56d6d] shrink-0"
                      onClick={() => navigate(`/meeting/${b.meetingRoomId}`)}
                    >
                      <Video className="h-4 w-4 mr-1" /> Vào lớp học
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
