import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Star, EyeOff, Trash2, CheckCircle } from "lucide-react";

import { Button } from "@fe/components/ui/button.tsx";
import { Badge } from "@fe/components/ui/badge.tsx";
import { Separator } from "@fe/components/ui/separator.tsx";
import { Skeleton } from "@fe/components/ui/skeleton.tsx";
import {
  useReviewReport,
  useResolveReviewReport,
  useDismissReviewReport,
  useDeleteReviewReport,
} from "@/features/review-reports/hooks/use-review-reports";
import {
  reviewReportStatusLabel,
  reviewReportStatusClassName,
} from "@/features/review-reports/types/review-report";

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

export default function ReviewReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reportId = Number(id);

  const { data: report, isLoading } = useReviewReport(reportId);
  const resolveMutation = useResolveReviewReport();
  const dismissMutation = useDismissReviewReport();
  const deleteMutation = useDeleteReviewReport();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy báo cáo.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/review-reports")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const statusLabel = reviewReportStatusLabel[report.status];
  const statusClassName = reviewReportStatusClassName[report.status];

  const handleResolve = () => {
    resolveMutation.mutate(reportId, {
      onSuccess: () => toast.success("Đã xử lý báo cáo"),
      onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || "Lỗi xử lý"),
    });
  };

  const handleDismiss = () => {
    dismissMutation.mutate(reportId, {
      onSuccess: () => {
        toast.success("Đã ẩn đánh giá");
        navigate("/review-reports");
      },
      onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || "Lỗi ẩn đánh giá"),
    });
  };

  const handleDelete = () => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.")) return;
    deleteMutation.mutate(reportId, {
      onSuccess: () => {
        toast.success("Đã xóa báo cáo");
        navigate("/review-reports");
      },
      onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || "Lỗi xóa"),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() => navigate("/review-reports")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại danh sách
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chi tiết báo cáo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Báo cáo #{report.id}
          </p>
        </div>
        <Badge variant="outline" className={statusClassName}>{statusLabel}</Badge>
      </div>

      <Separator />

      {/* Report Information */}
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Thông tin báo cáo</h2>
          <p className="text-sm text-muted-foreground">
            Chi tiết từ người báo cáo
          </p>
        </div>
        <div className="p-6 grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Người báo cáo</p>
            <p className="text-sm font-medium">{report.reporter?.name || "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ngày tạo</p>
            <p className="text-sm font-medium">{formatDate(report.createdAt)}</p>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Lý do</p>
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="text-sm font-medium text-orange-800">{report.reason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reported Review */}
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Đánh giá bị báo cáo</h2>
          <p className="text-sm text-muted-foreground">
            Nội dung đánh giá từ học viên
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Khóa học</p>
              <p className="text-sm font-medium">{report.review?.course?.title || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Học viên</p>
              <p className="text-sm font-medium">{report.review?.user?.name || "—"}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Đánh giá</p>
            {report.review && <Stars rating={report.review.rating} />}
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Nội dung</p>
            <blockquote className="rounded-lg border border-muted bg-muted/50 p-4">
              <p className="text-sm leading-relaxed italic text-muted-foreground">
                "{report.review?.comment || "Không có nội dung"}"
              </p>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Admin Decision Area */}
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Xử lý báo cáo</h2>
          <p className="text-sm text-muted-foreground">
            Chọn hành động cho báo cáo này
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-medium text-sm">Giữ đánh giá</h3>
              <p className="text-xs text-muted-foreground">
                Đánh giá hợp lệ. Đóng báo cáo và giữ nguyên đánh giá.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResolve}
                disabled={resolveMutation.isPending}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Giữ đánh giá
              </Button>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-medium text-sm">Ẩn đánh giá</h3>
              <p className="text-xs text-muted-foreground">
                Ẩn đánh giá khỏi học viên. Giữ trong database để kiểm duyệt.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDismiss}
                disabled={dismissMutation.isPending}
              >
                <EyeOff className="mr-2 h-4 w-4" />
                Ẩn đánh giá
              </Button>
            </div>

            <div className="rounded-lg border border-destructive/20 p-4 space-y-2">
              <h3 className="font-medium text-sm text-destructive">Xóa đánh giá</h3>
              <p className="text-xs text-muted-foreground">
                Xóa vĩnh viễn đánh giá khỏi hệ thống. Không thể hoàn tác.
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa đánh giá
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
