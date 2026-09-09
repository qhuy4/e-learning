import { BookOpen } from "lucide-react";

export function AdminCourseEmptyState() {
  return (
    <div className="text-center py-20 bg-card border border-border rounded-xl shadow-sm">
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <BookOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Không tìm thấy khóa học nào
      </h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
        Hiện tại không có khóa học nào khớp với điều kiện tìm kiếm.
      </p>
    </div>
  );
}
