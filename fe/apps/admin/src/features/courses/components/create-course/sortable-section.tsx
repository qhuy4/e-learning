import { useState } from "react";
import { toast } from "sonner";

import type { Course, Section, Lesson } from "../../types/course.types";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";

import { Plus, GripVertical, Trash2, Check } from "lucide-react";

import { useNavigate } from "react-router";

import { useSortable, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";

import { SortableLesson } from "./sortable-lesson";
import { useUpdateLesson, useDeleteLesson } from "@/features/lessons/hook/use-lessons";
import { useDeleteSection, useUpdateSection } from "../../hooks/use-courses";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface SortableSectionProps {
  section: Section;
  data: Course;
  updateData: (data: Partial<Course>) => void;
  courseId?: string | number;
  readOnly?: boolean;
}

export function SortableSection({
  section,
  data,
  updateData,
  courseId,
  readOnly = false,
}: SortableSectionProps) {
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(true);
  const [confirmDeleteSection, setConfirmDeleteSection] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(section.title ?? "");
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const titleChanged = editingTitle.trim() !== (section.title ?? "").trim();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sections = data.sections ?? [];
  const lessons = section.lessons ?? [];

  const { mutateAsync: updateLesson } = useUpdateLesson();
  const { mutateAsync: deleteLessonApi } = useDeleteLesson();
  const { mutateAsync: deleteSectionApi } = useDeleteSection();
  const { mutateAsync: updateSectionApi } = useUpdateSection();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleLessonDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => String(l.id) === String(active.id));
    const newIndex = lessons.findIndex((l) => String(l.id) === String(over.id));

    if (oldIndex === -1 || newIndex === -1) return;

    const newLessons = arrayMove(lessons, oldIndex, newIndex);
    const newSections = sections.map((item) =>
      item.id === section.id ? { ...item, lessons: newLessons } : item,
    );

    updateData({ sections: newSections });

    try {
      await Promise.all(
        newLessons.map((lesson, index) =>
          updateLesson({ id: Number(lesson.id), data: { position: index + 1 } })
        )
      );
    } catch {
      toast.error("Có lỗi xảy ra khi thay đổi vị trí bài học.");
    }
  };

  // ─── Delete section ────────────────────────────────────────────────────────
  const handleDeleteSectionConfirm = async () => {
    const tid = toast.loading("Đang xóa chương...");
    try {
      if (courseId && section.id && !String(section.id).startsWith("new_")) {
        await deleteSectionApi({ courseId: Number(courseId), sectionId: Number(section.id) });
      }
      updateData({ sections: sections.filter((item) => item.id !== section.id) });
      toast.success("Đã xóa chương thành công!", { id: tid });
    } catch {
      toast.error("Có lỗi xảy ra khi xóa chương.", { id: tid });
    } finally {
      setConfirmDeleteSection(false);
    }
  };

  // ─── Delete lesson ─────────────────────────────────────────────────────────
  const handleDeleteLessonConfirm = async () => {
    if (!deletingLessonId) return;
    const tid = toast.loading("Đang xóa bài học...");
    try {
      if (!String(deletingLessonId).startsWith("new_")) {
        await deleteLessonApi(Number(deletingLessonId));
      }
      const newSections = sections.map((item) =>
        item.id === section.id
          ? { ...item, lessons: lessons.filter((l) => l.id !== deletingLessonId) }
          : item,
      );
      updateData({ sections: newSections });
      toast.success("Đã xóa bài học thành công!", { id: tid });
    } catch {
      toast.error("Có lỗi xảy ra khi xóa bài học.", { id: tid });
    } finally {
      setDeletingLessonId(null);
    }
  };

  const handleSaveTitle = async () => {
    const newTitle = editingTitle.trim();
    if (!newTitle || !titleChanged) return;
    if (!courseId || String(section.id).startsWith("new_")) {
      // no API call needed, just update local
      updateData({
        sections: sections.map((item) =>
          item.id === section.id ? { ...item, title: newTitle } : item,
        ),
      });
      return;
    }
    setIsSavingTitle(true);
    try {
      await updateSectionApi({
        courseId: Number(courseId),
        sectionId: Number(section.id),
        section: { title: newTitle },
      });
      updateData({
        sections: sections.map((item) =>
          item.id === section.id ? { ...item, title: newTitle } : item,
        ),
      });
      toast.success("Đã cập nhật tên chương!");
    } catch {
      toast.error("Lỗi khi cập nhật tên chương.");
      setEditingTitle(section.title ?? ""); // revert
    } finally {
      setIsSavingTitle(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="border border-border rounded-md bg-background shadow-sm overflow-hidden group"
      >
        {/* Section header */}
        <div className="flex items-center gap-3 p-4 bg-muted/30 border-b border-border">
          {!readOnly && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:bg-muted p-1.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <GripVertical className="h-5 w-5" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-sm hover:bg-muted text-muted-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20" height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <Input
            value={editingTitle}
            disabled={readOnly}
            readOnly={readOnly}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); }}
            className={`flex-1 h-9 bg-transparent border-transparent font-medium text-foreground ${readOnly ? "cursor-default" : "hover:border-input focus:bg-background transition-colors"}`}
          />

          {/* Save title button — only visible when title changed and not readOnly */}
          {!readOnly && titleChanged && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveTitle}
              disabled={isSavingTitle}
              className="rounded-md text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 shrink-0"
              title="Lưu tên chương"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}

          {!readOnly && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/lessons/create?sectionId=${section.id}`)}
                className="rounded-md text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Thêm bài học
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDeleteSection(true)}
                className="rounded-md text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Lessons list */}
        {isExpanded && (
          <div className="p-4 space-y-3">
            {lessons.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed border-border rounded-lg">
                Chương này chưa có bài học nào.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleLessonDragEnd}
              >
                <SortableContext
                  items={lessons.map((lesson) => String(lesson.id))}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {lessons.map((lesson: Lesson, index: number) => (
                      <SortableLesson
                        key={lesson.id}
                        lesson={lesson}
                        index={index}
                        readOnly={readOnly}
                        onEdit={(id) => navigate(`/lessons/${id}/edit`)}
                        onDelete={(id) => setDeletingLessonId(id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}
      </div>

      {/* Confirm delete section */}
      <ConfirmDialog
        open={confirmDeleteSection}
        title="Xóa chương học"
        description={`Xóa chương "${section.title}" sẽ xóa tất cả bài học bên trong. Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa chương"
        onConfirm={handleDeleteSectionConfirm}
        onCancel={() => setConfirmDeleteSection(false)}
      />

      {/* Confirm delete lesson */}
      <ConfirmDialog
        open={deletingLessonId !== null}
        title="Xóa bài học"
        description="Bạn có chắc chắn muốn xóa bài học này không? Hành động này không thể hoàn tác."
        confirmLabel="Xóa bài học"
        onConfirm={handleDeleteLessonConfirm}
        onCancel={() => setDeletingLessonId(null)}
      />
    </>
  );
}
