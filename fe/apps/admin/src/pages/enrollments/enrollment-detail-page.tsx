import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@fe/components/ui/button.tsx";
import { Badge } from "@fe/components/ui/badge.tsx";
import { Separator } from "@fe/components/ui/separator.tsx";
import { useEnrollment } from "@/features/enrollments/hooks/use-enrollment";
import { EnrollmentStatus, enrollmentStatusLabel, enrollmentStatusClassName } from "@/features/enrollments/types/enrollment";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

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

export default function EnrollmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: enrollment, isLoading, isError } = useEnrollment(id ?? "");

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (isError || !enrollment) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy thông tin ghi danh.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/enrollments")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const currentStatus = enrollment.status as EnrollmentStatus;

  return (
      <div className="p-6 space-y-6">
        {/* Back */}
        <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => navigate("/enrollments")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách ghi danh
        </Button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Ghi danh #{enrollment.id}
            </h1>

            <Badge className={enrollmentStatusClassName[currentStatus]}>
              {enrollmentStatusLabel[currentStatus]}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mt-1">
            {enrollment.userName} — {enrollment.courseTitle}
          </p>
        </div>

        {/* Information grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Học viên */}
          <div className="rounded-xl border bg-card">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold">Học viên</h2>
              <p className="text-sm text-muted-foreground">
                Thông tin người đăng ký khóa học
              </p>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
              <Field
                  label="Họ tên"
                  value={enrollment.userName}
              />

              <Field
                  label="Email"
                  value={enrollment.userEmail}
              />
            </div>
          </div>

          {/* Thanh toán */}
          <div className="rounded-xl border bg-card">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold">Thanh toán</h2>
              <p className="text-sm text-muted-foreground">
                Thông tin giao dịch
              </p>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
              <Field
                  label="Giá đã trả"
                  value={
                    enrollment.pricePaid
                        ? formatCurrency(enrollment.pricePaid)
                        : "—"
                  }
              />

              <Field
                  label="Đơn vị"
                  value={enrollment.currency}
              />
            </div>
          </div>

          {/* Khóa học */}
          <div className="rounded-xl border bg-card">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold">Khóa học</h2>
              <p className="text-sm text-muted-foreground">
                Khóa học được ghi danh
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4">
                {enrollment.courseThumbnail && (
                    <img
                        src={enrollment.courseThumbnail}
                        alt={enrollment.courseTitle}
                        className="w-20 h-12 rounded-lg object-cover border shrink-0"
                    />
                )}

                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {enrollment.courseTitle}
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    Course ID: {enrollment.courseId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Thời gian */}
          <div className="rounded-xl border bg-card">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold">Thời gian</h2>
              <p className="text-sm text-muted-foreground">
                Lịch sử ghi danh
              </p>
            </div>

            <div className="p-6 grid grid-cols-2 gap-x-6 gap-y-5">
              <Field
                  label="Ngày ghi danh"
                  value={formatDate(enrollment.enrolledAt)}
              />

              <Field
                  label="Truy cập lần cuối"
                  value={formatDate(enrollment.lastAccessedAt)}
              />

              <Field
                  label="Ngày hoàn thành"
                  value={formatDate(enrollment.completedAt)}
              />

              <Field
                  label="Ngày tạo"
                  value={formatDate(enrollment.createdAt)}
              />

              <Field
                  label="Cập nhật"
                  value={formatDate(enrollment.updatedAt)}
              />
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">Tiến độ học tập</h2>
            <p className="text-sm text-muted-foreground">
              Mức độ hoàn thành khóa học
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-end justify-between mb-3">
        <span className="text-sm text-muted-foreground">
          Hoàn thành
        </span>

              <span className="text-2xl font-bold">
          {enrollment.progress}%
        </span>
            </div>

            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${enrollment.progress}%`,
                  }}
              />
            </div>
          </div>
        </div>
      </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
