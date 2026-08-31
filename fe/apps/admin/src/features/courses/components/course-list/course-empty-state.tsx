import { BookOpen, Plus } from "lucide-react";
import { Button } from "@fe/components/ui/button";

interface CourseEmptyStateProps {
  onCreateClick: () => void;
}

export function CourseEmptyState({ onCreateClick }: CourseEmptyStateProps) {
  return (
    <div className="text-center py-20 bg-card border border-border rounded-xl shadow-sm">
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <BookOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Không tìm thấy khóa học nào
      </h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
        Hãy thử thay đổi điều kiện tìm kiếm hoặc tạo khóa học mới.
      </p>
      <Button onClick={onCreateClick} variant="outline" className="mt-6">
        <Plus className="h-4 w-4 mr-2" />
        Tạo khóa học ngay
      </Button>
    </div>
  );
}
