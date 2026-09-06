import { Button } from "@fe/components/ui/button";
import { Edit, Trash2, BookOpen, Eye, RotateCcw } from "lucide-react";
import { courseService } from "../../services/course.service";

export const LEVEL_LABELS: Record<number, string> = {
  1: "Cơ bản",
  2: "Trung bình",
  3: "Nâng cao",
};

export const STATUS_CONFIG: Record<number, { label: string; className: string }> = {
  1: { label: "Bản nháp", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  2: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  4: { label: "Bị từ chối", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  5: { label: "Đã xuất bản", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  6: { label: "Lưu trữ", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    level: number;
    price: number;
    status: number;
    slug?: string;
    parentId?: number | null;
  };
  onEdit: (course: any) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  onCancelReview?: (course: any) => void;
  isCancelingReview?: boolean;
}

export function CourseCard({
  course,
  onEdit,
  onDelete,
  isDeleting,
  onCancelReview,
  isCancelingReview,
}: CourseCardProps) {
  const statusInfo = STATUS_CONFIG[course.status];
  const isPendingReview = course.status === 2;

  const handlePreview = async () => {
    try {
      const res = await courseService.getPreviewToken(course.id);
      if (res?.token) {
        window.open(`http://localhost:5173/courses/preview/${res.token}`, '_blank');
      }
    } catch (error) {
      console.error('Lỗi lấy preview token:', error);
    }
  };

  return (
    <div className="group bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full gap-2 text-muted-foreground">
            <BookOpen className="h-8 w-8 opacity-40" />
            <span className="text-xs opacity-60">Chưa có ảnh</span>
          </div>
        )}

        {/* Level badge */}
        {course.level && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 text-xs font-semibold bg-background/90 backdrop-blur-sm rounded-md shadow-sm border border-border/50">
              {LEVEL_LABELS[course.level] ?? course.level}
            </span>
          </div>
        )}

        {/* Quick action on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          {/* Nút Xem thử luôn hiển thị */}
          <Button
            size="sm"
            variant="secondary"
            onClick={handlePreview}
            className="shadow-md bg-white/90 text-emerald-700 hover:text-emerald-800 hover:bg-white dark:bg-zinc-800/90 dark:text-emerald-400"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Xem thử
          </Button>

          {isPendingReview ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onCancelReview?.(course)}
              disabled={isCancelingReview}
              className="shadow-md bg-white/90 text-amber-600 hover:text-amber-700 hover:bg-white dark:bg-zinc-800/90 dark:text-amber-400"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Hủy duyệt
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(course)}
              className="shadow-md bg-white/90 text-slate-700 hover:text-slate-900 hover:bg-white dark:bg-zinc-800/90 dark:text-slate-300"
            >
              <Edit className="h-4 w-4 mr-1.5" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base line-clamp-2 leading-snug group-hover:text-primary transition-colors flex-1">
            {course.title}
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {statusInfo && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          )}
          {course.parentId && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Đang cập nhật phiên bản mới
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {course.description || "Chưa có mô tả cho khóa học này."}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="font-bold text-primary text-base">
            {course.price > 0
              ? `${Number(course.price).toLocaleString("vi-VN")} đ`
              : "Miễn phí"}
          </div>

          <div className="flex gap-1">
            {/* Nút Xem thử — màu xanh emerald */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreview}
              className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg"
              title="Xem thử"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Nút Hủy duyệt hoặc Chỉnh sửa — màu đồng nhất (primary) */}
            {isPendingReview ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCancelReview?.(course)}
                disabled={isCancelingReview}
                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-950/50 rounded-lg"
                title="Hủy duyệt để chỉnh sửa"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(course)}
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                title="Chỉnh sửa"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {/* Nút Xóa — màu đỏ */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(course.id)}
              disabled={isDeleting}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
              title="Xóa"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
