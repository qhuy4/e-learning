import { useNavigate, useParams } from "react-router-dom";
import { useReviewReport, useResolveReviewReport, useDismissReviewReport, useDeleteReviewReport } from "@/features/review-reports/hooks/use-review-reports";
import { reviewReportStatusLabel, reviewReportStatusClassName } from "@/features/review-reports/types/review-report";
import { Card, CardContent, CardHeader, CardTitle } from "@fe/components/ui/card";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { Separator } from "@fe/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Skeleton } from "@fe/components/ui/skeleton";

export default function ReviewReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reportId = Number(id);

  const { data: report, isLoading } = useReviewReport(reportId);
  const resolveMutation = useResolveReviewReport();
  const dismissMutation = useDismissReviewReport();
  const deleteMutation = useDeleteReviewReport();

  const handleResolve = () => {
    resolveMutation.mutate(reportId, {
      onSuccess: () => toast.success("Đã xử lý báo cáo"),
      onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || "Lỗi xử lý"),
    });
  };

  const handleDismiss = () => {
    dismissMutation.mutate(reportId, {
      onSuccess: () => toast.success("Đã từ chối báo cáo"),
      onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || "Lỗi từ chối"),
    });
  };

  const handleDelete = () => {
    if (!confirm("Bạn có chắc muốn xóa báo cáo này?")) return;
    deleteMutation.mutate(reportId, {
      onSuccess: () => {
        toast.success("Đã xóa báo cáo");
        navigate("/review-reports");
      },
      onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || "Lỗi xóa"),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  if (!report) return null;

  const statusLabel = reviewReportStatusLabel[report.status];
  const statusClassName = reviewReportStatusClassName[report.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/review-reports")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Báo cáo #{report.id}</h1>
          <Badge variant="outline" className={statusClassName}>{statusLabel}</Badge>
        </div>
        <div className="flex gap-2">
          {report.status === 0 && (
            <>
              <Button variant="outline" onClick={handleDismiss} disabled={dismissMutation.isPending}>
                <XCircle className="h-4 w-4 mr-2" />
                Từ chối
              </Button>
              <Button onClick={handleResolve} disabled={resolveMutation.isPending}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Xử lý
              </Button>
            </>
          )}
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin báo cáo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Người báo cáo</p>
                <p>{report.reporter?.name || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
                <p>{report.createdAt ? new Date(report.createdAt).toLocaleDateString("vi-VN") : "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lý do</p>
              <p className="whitespace-pre-wrap">{report.reason}</p>
            </div>
            {report.resolvedAt && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Người xử lý</p>
                    <p>{report.resolver?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ngày xử lý</p>
                    <p>{new Date(report.resolvedAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đánh giá bị báo cáo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.review && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Khóa học</p>
                    <p>{report.review.course?.title || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Học viên</p>
                    <p>{report.review.user?.name || "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Đánh giá</p>
                  <p>{"⭐".repeat(report.review.rating)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nội dung</p>
                  <p className="whitespace-pre-wrap">{report.review.comment || "—"}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
