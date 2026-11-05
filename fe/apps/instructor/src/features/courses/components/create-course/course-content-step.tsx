import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Plus, ListTree, Trash2, ChevronDown, Video, Edit } from "lucide-react";

import type { Course, Section, Lesson } from "../../types/course.types";
import { useCreateSection, useDeleteSection, useDeleteLesson } from "../../hook/use-courses";
import { getErrorMessage } from "@/shared/utils/error";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface CourseContentStepProps {
  data: Course;
  updateData: (data: Partial<Course>) => void;
}

export function CourseContentStep({ data, updateData }: CourseContentStepProps) {
  const courseId = data.id ? Number(data.id) : undefined;
  const sections = data.sections ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Chương trình học</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý các chương và bài học trong khóa học.
        </p>
      </div>
      <SectionList courseId={courseId} sections={sections} updateData={updateData} />
    </div>
  );
}

function SectionList({
  courseId,
  sections,
  updateData,
}: {
  courseId?: number;
  sections: Section[];
  updateData: (data: Partial<Course>) => void;
}) {
  const [newTitle, setNewTitle] = useState("");
  const { mutateAsync: createSection, isPending } = useCreateSection();

  const addSection = async () => {
    const title = newTitle.trim();
    if (!title) return;
    if (!courseId) {
      toast.error("Vui lòng lưu khóa học trước khi thêm chương!");
      return;
    }
    try {
      const res = await createSection({ courseId, section: { title, position: sections.length + 1 } });
      const created = res.data;
      updateData({ sections: [...sections, { ...created, lessons: created.lessons ?? [] }] });
      setNewTitle("");
      toast.success("Đã thêm chương!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6 bg-card border border-border shadow-sm rounded-md p-6">
      <div className="flex gap-3 items-center bg-muted/20 p-2 rounded-md border border-border">
        <div className="relative flex-1">
          <div className="absolute left-3 top-3.5 text-muted-foreground">
            <ListTree className="w-4 h-4" />
          </div>
          <Input
            placeholder="Nhập tên chương mới..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addSection(); }}
            className="h-11 pl-10 bg-background rounded-sm border-transparent focus-visible:ring-1 focus-visible:border-input shadow-sm"
          />
        </div>
        <Button onClick={addSection} disabled={isPending || !newTitle.trim()} className="h-11 shrink-0 px-6 rounded-sm shadow-sm bg-primary/90 hover:bg-primary">
          <Plus className="h-4 w-4 mr-2" />
          {isPending ? "Đang thêm..." : "Thêm chương"}
        </Button>
      </div>

      <div className="space-y-5">
        {sections.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-12 border-2 border-dashed border-border rounded-lg">
            Chưa có chương học nào. Hãy thêm chương mới.
          </div>
        ) : (
          sections.map((section, index) => (
            <SectionItem key={section.id} section={section} index={index} courseId={courseId} sections={sections} updateData={updateData} />
          ))
        )}
      </div>
    </div>
  );
}

function SectionItem({
  section,
  index,
  courseId,
  sections,
  updateData,
}: {
  section: Section;
  index: number;
  courseId?: number;
  sections: Section[];
  updateData: (data: Partial<Course>) => void;
}) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  const lessons = section.lessons ?? [];
  const { mutateAsync: deleteSectionApi } = useDeleteSection();
  const { mutateAsync: deleteLessonApi } = useDeleteLesson();
  const isPersisted = courseId && !String(section.id).startsWith("new_");

  const updateSectionLessons = (newLessons: Lesson[]) => {
    updateData({ sections: sections.map((s) => s.id === section.id ? { ...s, lessons: newLessons } : s) });
  };

  const handleDeleteSection = async () => {
    const tid = toast.loading("Đang xóa chương...");
    try {
      if (isPersisted) {
        await deleteSectionApi({ courseId, sectionId: Number(section.id) });
      }
      updateData({ sections: sections.filter((s) => s.id !== section.id) });
      toast.success("Đã xóa chương!", { id: tid });
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    } finally {
      setConfirmDelete(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!deletingLessonId) return;
    const tid = toast.loading("Đang xóa bài học...");
    try {
      if (!String(deletingLessonId).startsWith("new_")) {
        await deleteLessonApi({
          id: Number(deletingLessonId),
          courseId,
        });
      }
      updateSectionLessons(lessons.filter((l) => l.id !== deletingLessonId));
      toast.success("Đã xóa bài học!", { id: tid });
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    } finally {
      setDeletingLessonId(null);
    }
  };

  return (
    <>
      <div className="border border-border rounded-md bg-background shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-4 bg-muted/30 border-b border-border">
          <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-sm hover:bg-muted text-muted-foreground transition-colors">
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </button>
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">{index + 1}</div>
          <div className="flex-1 font-medium text-foreground">{section.title}</div>
          <span className="text-xs text-muted-foreground">{lessons.length} bài học</span>
          <Button variant="outline" size="sm" onClick={() => navigate(`/lessons/create?sectionId=${section.id}&courseId=${courseId}`)} className="rounded-md text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Thêm bài học
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} className="rounded-md text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {isExpanded && (
          <div className="p-4 space-y-3">
            {lessons.length > 0 ? (
              <div className="space-y-2">
                {lessons.map((lesson, li) => (
                  <div key={lesson.id} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      <Video className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Bài {li + 1}: {lesson.title}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600" onClick={() => navigate(`/lessons/${lesson.id}/edit?sectionId=${section.id}&courseId=${courseId}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeletingLessonId(lesson.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed border-border rounded-lg">
                Chương này chưa có bài học nào.
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog open={confirmDelete} title="Xóa chương học" description={`Xóa chương "${section.title}" sẽ xóa tất cả bài học bên trong. Hành động này không thể hoàn tác.`} confirmLabel="Xóa chương" onConfirm={handleDeleteSection} onCancel={() => setConfirmDelete(false)} />
      <ConfirmDialog open={deletingLessonId !== null} title="Xóa bài học" description="Bạn có chắc chắn muốn xóa bài học này không? Hành động này không thể hoàn tác." confirmLabel="Xóa bài học" onConfirm={handleDeleteLesson} onCancel={() => setDeletingLessonId(null)} />
    </>
  );
}
