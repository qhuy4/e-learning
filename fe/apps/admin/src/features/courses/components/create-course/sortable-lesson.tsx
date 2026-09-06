import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Video, Edit } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import type { Lesson } from "../../types/course.types";

interface SortableLessonProps {
  lesson: Lesson;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

export function SortableLesson({
  lesson,
  index,
  onEdit,
  onDelete,
  readOnly = false,
}: SortableLessonProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: lesson.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm transition-all"
    >
      {!readOnly && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:bg-muted p-1.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
        <Video className="h-4 w-4" />
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          Bài {index + 1}: {lesson.title}
        </p>
      </div>

      {!readOnly && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-blue-600"
            onClick={() => onEdit(lesson.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(lesson.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
