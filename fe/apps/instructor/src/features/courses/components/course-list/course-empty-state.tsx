import { BookOpen } from "lucide-react";

export function CourseEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <BookOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Chưa có khóa học nào</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Bạn chưa tạo khóa học nào. Hãy bắt đầu tạo khóa học đầu tiên của bạn.
      </p>
    </div>
  );
}
