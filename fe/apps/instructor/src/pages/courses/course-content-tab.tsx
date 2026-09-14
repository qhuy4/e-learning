import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ChevronDown,
  Video,
  Headphones,
  FileText,
  HelpCircle,
  Radio,
  Edit,
  GripVertical,
} from "lucide-react";
import { useGetCourseDetail, useCreateSection, useDeleteSection, useDeleteLesson } from "@/features/courses/hook/use-courses";
import { COURSE_STATUS_CONFIG } from "@/features/courses/types/course.constants";
import type { Section, Lesson } from "@/features/courses/types/course.types";
import { getErrorMessage } from "@/shared/utils/error";
import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Badge } from "@fe/components/ui/badge";
import { Card, CardContent } from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";

function canEditCourse(status?: number): boolean {
  return status !== 2 && status !== 6;
}

const LESSON_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  video: Video,
  audio: Headphones,
  text: FileText,
  document: FileText,
  quiz: HelpCircle,
  live: Radio,
};

function formatDuration(seconds: number): string {
  if (!seconds) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function CourseContentTab() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: courseResponse, isLoading } = useGetCourseDetail(courseId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const course = (courseResponse as any)?.data ?? (courseResponse as any)?.data?.data;
  if (!course) return null;

  const editable = canEditCourse(course.status);
  const sections: Section[] = course.sections ?? [];
  const numCourseId = courseId ? Number(courseId) : undefined;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {sections.length} chương ·{" "}
            {sections.reduce((sum: number, s: any) => sum + (s.lessons ?? []).length, 0)} bài học
          </p>
        </div>
      </div>

      {/* Section list */}
      {sections.length > 0 ? (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <SectionItem
              key={section.id}
              section={section}
              index={index}
              courseId={numCourseId}
              editable={editable}
              allSections={sections}
              courseStatus={course.status}
            />
          ))}
        </div>
      ) : (
        <EmptyState editable={editable} courseId={numCourseId} />
      )}

      {/* Add section */}
      {editable && sections.length > 0 && (
        <AddSection courseId={numCourseId} sectionCount={sections.length} />
      )}
    </div>
  );
}

function EmptyState({ editable, courseId }: { editable: boolean; courseId?: number }) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="p-10 flex flex-col items-center text-center gap-3">
        <div className="rounded-full bg-muted p-3">
          <Video className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Chưa có chương trình học</p>
        {editable && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/courses/${courseId}/edit`)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Thêm chương đầu tiên
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function AddSection({ courseId, sectionCount }: { courseId?: number; sectionCount: number }) {
  const [title, setTitle] = useState("");
  const { mutateAsync: createSection, isPending } = useCreateSection();

  const handleAdd = async () => {
    const t = title.trim();
    if (!t) return;
    if (!courseId) {
      toast.error("Không tìm thấy khóa học");
      return;
    }
    try {
      await createSection({
        courseId,
        section: { title: t, position: sectionCount + 1 },
      });
      setTitle("");
      toast.success("Đã thêm chương!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Input
        placeholder="Nhập tên chương mới..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        disabled={isPending}
        className="h-9"
      />
      <Button onClick={handleAdd} disabled={isPending || !title.trim()} size="sm" className="h-9 shrink-0">
        <Plus className="h-4 w-4 mr-1.5" />
        {isPending ? "Đang thêm..." : "Thêm chương"}
      </Button>
    </div>
  );
}

function SectionItem({
  section,
  index,
  courseId,
  editable,
  allSections,
  courseStatus,
}: {
  section: Section;
  index: number;
  courseId?: number;
  editable: boolean;
  allSections: Section[];
  courseStatus?: number;
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(section.title);

  const lessons: Lesson[] = section.lessons ?? [];
  const { mutateAsync: deleteSectionApi } = useDeleteSection();
  const { mutateAsync: deleteLessonApi } = useDeleteLesson();

  const handleDeleteSection = async () => {
    const tid = toast.loading("Đang xóa chương...");
    try {
      if (courseId && !String(section.id).startsWith("new_")) {
        await deleteSectionApi({ courseId, sectionId: Number(section.id) });
      }
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
        await deleteLessonApi(Number(deletingLessonId));
      }
      toast.success("Đã xóa bài học!", { id: tid });
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    } finally {
      setDeletingLessonId(null);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        {/* Section header */}
        <div
          className="flex items-center gap-3 px-4 py-3 bg-muted/30 cursor-pointer select-none"
          onClick={() => setExpanded(!expanded)}
        >
          {editable && <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />}
          <button
            type="button"
            className="p-0.5 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>

          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
            {index + 1}
          </span>

          {editingTitle ? (
            <Input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditingTitle(false);
                if (e.key === "Escape") {
                  setTitleValue(section.title);
                  setEditingTitle(false);
                }
              }}
              onBlur={() => setEditingTitle(false)}
              autoFocus
              className="h-7 text-sm flex-1"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 text-sm font-medium truncate">{section.title}</span>
          )}

          <span className="text-xs text-muted-foreground shrink-0">
            {lessons.length} bài
          </span>

          {editable && (
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => navigate(`/lessons/create?sectionId=${section.id}&courseId=${courseId}`)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Bài học
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setEditingTitle(true)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Lessons */}
        {expanded && (
          <CardContent className="p-0">
            {lessons.length > 0 ? (
              <div className="divide-y">
                {lessons.map((lesson, li) => {
                  const Icon = LESSON_TYPE_ICONS[lesson.type] ?? FileText;
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors"
                    >
                      <span className="text-xs text-muted-foreground w-6 text-right shrink-0">
                        {String(li + 1).padStart(2, "0")}
                      </span>
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-sm truncate">{lesson.title}</span>
                      {lesson.isPreview && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 h-4 shrink-0">
                          Free
                        </Badge>
                      )}
                      {lesson.duration != null && (
                        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                          {formatDuration(lesson.duration)}
                        </span>
                      )}
                      {editable && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              navigate(`/lessons/${lesson.id}/edit?sectionId=${section.id}&courseId=${courseId}`)
                            }
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeletingLessonId(lesson.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {editable ? (
                  <>
                    Chưa có bài học.{" "}
                    <button
                      className="text-primary hover:underline"
                      onClick={() =>
                        navigate(`/lessons/create?sectionId=${section.id}&courseId=${courseId}`)
                      }
                    >
                      Thêm bài học
                    </button>
                  </>
                ) : (
                  "Chương này chưa có bài học."
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Xóa chương học"
        description={`Xóa chương "${section.title}" sẽ xóa tất cả bài học bên trong. Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa chương"
        onConfirm={handleDeleteSection}
        onCancel={() => setConfirmDelete(false)}
      />
      <ConfirmDialog
        open={deletingLessonId !== null}
        title="Xóa bài học"
        description="Bạn có chắc chắn muốn xóa bài học này không? Hành động này không thể hoàn tác."
        confirmLabel="Xóa bài học"
        onConfirm={handleDeleteLesson}
        onCancel={() => setDeletingLessonId(null)}
      />
    </>
  );
}
