import { Button } from "@fe/components/ui/button";
import { Edit, Trash2, BookOpen } from "lucide-react";

export const LEVEL_LABELS: Record<number, string> = {
  1: "Cơ bản",
  2: "Trung bình",
  3: "Nâng cao",
};

export const STATUS_CONFIG: Record<number, { label: string; className: string }> = {
  1: { label: "Bản nháp", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  2: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  3: { label: "Đã duyệt", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
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
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function CourseCard({ course, onEdit, onDelete, isDeleting }: CourseCardProps) {
  const statusInfo = STATUS_CONFIG[course.status];

  return (
    <div className="group bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
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

        {course.level && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 text-xs font-semibold bg-background/90 backdrop-blur-sm rounded-md shadow-sm border border-border/50">
              {LEVEL_LABELS[course.level] ?? course.level}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(course.id)}
            className="shadow-md"
          >
            <Edit className="h-4 w-4 mr-1.5" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base line-clamp-2 leading-snug group-hover:text-primary transition-colors flex-1">
            {course.title}
          </h3>
        </div>

        {statusInfo && (
          <div className="mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {course.description || "Chưa có mô tả cho khóa học này."}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="font-bold text-primary text-base">
            {course.price > 0
              ? `${Number(course.price).toLocaleString("vi-VN")} đ`
              : "Miễn phí"}
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(course.id)}
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
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
