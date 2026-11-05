import { useRef, useState } from "react";
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
  FileQuestion,
  Radio,
  Edit,
  GripVertical,
} from "lucide-react";
import {
  useGetCourseDetail,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useDeleteLesson,
} from "@/features/courses/hook/use-courses";
import type { Section, Lesson } from "@/features/courses/types/course.types";
import { getErrorMessage } from "@/shared/utils/error";
import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Badge } from "@fe/components/ui/badge";
import { Card, CardContent } from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@fe/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LessonQuizList } from "./lesson-quiz-list";
import { LessonDictationList } from "./lesson-dictation-list";

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

function getNextChapterNumber(sections: Section[]): number {
  const numbers = sections
    .map((section) => /^Chương\s+(\d+)\b/i.exec(section.title)?.[1])
    .filter((value): value is string => Boolean(value))
    .map(Number);
  return Math.max(sections.length, ...numbers, 0) + 1;
}

function getNextSectionPosition(sections: Section[]): number {
  return (
    Math.max(
      0,
      ...sections.map((section, index) => section.position ?? index + 1),
    ) + 1
  );
}

export default function CourseContentTab() {
  const { courseId } = useParams<{ courseId: string }>();
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
  const nextChapterNumber = getNextChapterNumber(sections);
  const nextSectionPosition = getNextSectionPosition(sections);

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
            />
          ))}
        </div>
      ) : (
        <EmptyState
          editable={editable}
          courseId={numCourseId}
          nextChapterNumber={nextChapterNumber}
          position={nextSectionPosition}
        />
      )}

      {/* Add section */}
      {editable && sections.length > 0 && (
        <AddSection
          courseId={numCourseId}
          nextChapterNumber={nextChapterNumber}
          position={nextSectionPosition}
        />
      )}
    </div>
  );
}

function EmptyState({
  editable,
  courseId,
  nextChapterNumber,
  position,
}: {
  editable: boolean;
  courseId?: number;
  nextChapterNumber: number;
  position: number;
}) {
  return (
    <Card>
      <CardContent className="p-10 flex flex-col items-center text-center gap-3">
        <div className="rounded-full bg-muted p-3">
          <Video className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Chưa có chương trình học</p>
        {editable && (
          <AddSection
            courseId={courseId}
            nextChapterNumber={nextChapterNumber}
            position={position}
          />
        )}
      </CardContent>
    </Card>
  );
}

function AddSection({
  courseId,
  nextChapterNumber,
  position,
}: {
  courseId?: number;
  nextChapterNumber: number;
  position: number;
}) {
  const { mutateAsync: createSection, isPending } = useCreateSection();

  const handleAdd = async () => {
    if (!courseId) {
      toast.error("Không tìm thấy khóa học");
      return;
    }
    try {
      await createSection({
        courseId,
        section: { title: `Chương ${nextChapterNumber}`, position },
      });
      toast.success(`Đã thêm Chương ${nextChapterNumber}!`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Button onClick={handleAdd} disabled={isPending || !courseId} size="sm" className="h-9">
      <Plus className="h-4 w-4 mr-1.5" />
      {isPending ? "Đang thêm..." : "Thêm chương"}
    </Button>
  );
}

function SectionItem({
  section,
  index,
  courseId,
  editable,
}: {
  section: Section;
  index: number;
  courseId?: number;
  editable: boolean;
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(section.title);
  const cancelTitleEditRef = useRef(false);

  const toggleLesson = (lessonId: string | number) => {
    setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const lessons: Lesson[] = section.lessons ?? [];
  const { mutateAsync: deleteSectionApi } = useDeleteSection();
  const { mutateAsync: deleteLessonApi } = useDeleteLesson();
  const { mutateAsync: updateSectionApi, isPending: isSavingTitle } = useUpdateSection();

  const handleSaveTitle = async () => {
    if (cancelTitleEditRef.current) {
      cancelTitleEditRef.current = false;
      setTitleValue(section.title);
      setEditingTitle(false);
      return;
    }

    const nextTitle = titleValue.trim();
    if (!nextTitle || nextTitle === section.title) {
      setTitleValue(section.title);
      setEditingTitle(false);
      return;
    }

    if (!courseId) {
      setTitleValue(section.title);
      setEditingTitle(false);
      return;
    }

    try {
      await updateSectionApi({
        courseId,
        sectionId: Number(section.id),
        data: { title: nextTitle },
      });
      toast.success("Đã đổi tên chương!");
    } catch (err) {
      setTitleValue(section.title);
      toast.error(getErrorMessage(err));
    } finally {
      setEditingTitle(false);
    }
  };

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
        await deleteLessonApi({ id: Number(deletingLessonId), courseId });
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
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  cancelTitleEditRef.current = true;
                  e.currentTarget.blur();
                }
              }}
              onBlur={() => void handleSaveTitle()}
              disabled={isSavingTitle}
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
                    <div key={lesson.id} className="flex flex-col">
                      <div 
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors cursor-pointer select-none"
                        onClick={() => toggleLesson(lesson.id)}
                      >
                        <button
                          type="button"
                          className="p-0.5 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLesson(lesson.id);
                          }}
                        >
                          <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${expandedLessons[lesson.id] ? "rotate-180" : ""}`} />
                        </button>
                        <span className="text-xs text-muted-foreground w-4 text-right shrink-0">
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
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Thêm Bài Tập"
                                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                                  >
                                    <FileQuestion className="h-3.5 w-3.5" />
                                  </Button>
                                }
                              />
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => navigate(`/quizzes/create?lessonId=${lesson.id}&courseId=${courseId}`)}
                                >
                                  Tạo Quiz (Trắc nghiệm)
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => navigate(`/dictations/create?lessonId=${lesson.id}&courseId=${courseId}`)}
                                >
                                  Tạo Nghe chép chính tả
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                      {expandedLessons[lesson.id] && (
                        <>
                          <LessonQuizList lessonId={Number(lesson.id)} courseId={courseId!} editable={editable} />
                          <LessonDictationList lessonId={Number(lesson.id)} courseId={courseId!} editable={editable} />
                        </>
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
