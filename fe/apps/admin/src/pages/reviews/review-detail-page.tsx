import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button.tsx";
import { Badge } from "@fe/components/ui/badge.tsx";
import { Avatar, AvatarFallback } from "@fe/components/ui/avatar.tsx";
import { Skeleton } from "@fe/components/ui/skeleton.tsx";
import { useReview, useUpdateReviewStatus } from "@/features/reviews/hook/use-review.ts";
import { reviewStatusLabel, reviewStatusClassName, type ReviewStatus } from "@/features/reviews/types/review.ts";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-5 ${star <= rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: review, isLoading } = useReview(id ?? "");
  const updateStatusMutation = useUpdateReviewStatus();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy đánh giá.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/reviews")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const status = review.status as ReviewStatus;

  const handleUpdateStatus = (newStatus: number) => {
    updateStatusMutation.mutate(
      { id: id!, status: newStatus },
      {
        onSuccess: () => toast.success("Cập nhật trạng thái thành công"),
        onError: (err: any) => toast.error(err?.response?.data?.message || "Lỗi"),
      },
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() => navigate("/reviews")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại danh sách
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Đánh giá #{review.id}</h1>
          <Badge className={reviewStatusClassName[status]}>{reviewStatusLabel[status]}</Badge>
        </div>
        <div className="flex gap-2">
          {status !== 1 && (
            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(1)}>
              <Eye className="mr-2 h-4 w-4" /> Hiển thị
            </Button>
          )}
          {status !== 2 && (
            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(2)}>
              <EyeOff className="mr-2 h-4 w-4" /> Ẩn
            </Button>
          )}
          {status !== 3 && (
            <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(3)}>
              Vi phạm
            </Button>
          )}
        </div>
      </div>

      {/* Nội dung đánh giá */}
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Nội dung đánh giá</h2>
          <p className="text-sm text-muted-foreground">
            Đánh giá từ học viên
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-10">
              <AvatarFallback>{review.user?.name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{review.user?.name || "—"}</p>
              <p className="text-xs text-muted-foreground">{review.course?.title || "—"}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Đánh giá</p>
            <Stars rating={review.rating} />
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Nội dung</p>
            <blockquote className="rounded-lg border border-muted bg-muted/50 p-4">
              <p className="text-sm leading-relaxed italic text-muted-foreground">
                "{review.comment || "Không có nội dung"}"
              </p>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Thông tin */}
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Thông tin</h2>
          <p className="text-sm text-muted-foreground">
            Chi tiết đánh giá
          </p>
        </div>
        <div className="p-6 grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Người đánh giá</p>
            <p className="text-sm font-medium">{review.user?.name || "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Khóa học</p>
            <p className="text-sm font-medium">{review.course?.title || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
