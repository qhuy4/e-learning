import { useParams, useNavigate } from "react-router";
import {
  Edit,
  BookOpen,
  Clock,
  Users,
  Layers,
  FileText,
  Video,
  Headphones,
  HelpCircle,
  Radio,
  Star,
} from "lucide-react";
import { useGetCourseDetail } from "@/features/courses/hook/use-courses";
import { LEVEL_LABELS, COURSE_STATUS_CONFIG } from "@/features/courses/types/course.constants";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Card, CardContent } from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import { Separator } from "@fe/components/ui/separator";

function formatPrice(price: number): string {
  if (price <= 0) return "Miễn phí";
  return `${Number(price).toLocaleString("vi-VN")}đ`;
}

function canEditCourse(status?: number): boolean {
  return status !== 2 && status !== 6;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const LESSON_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  video: Video,
  audio: Headphones,
  text: FileText,
  document: FileText,
  quiz: HelpCircle,
  live: Radio,
};

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="rounded-md bg-background p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-semibold leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function CourseOverviewTab() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: courseResponse, isLoading } = useGetCourseDetail(courseId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const course = (courseResponse as any)?.data ?? (courseResponse as any)?.data?.data;
  if (!course) return null;

  const statusCfg = COURSE_STATUS_CONFIG[course.status];
  const editable = canEditCourse(course.status);
  const sections = course.sections ?? [];
  const allLessons = sections.flatMap((s: any) => s.lessons ?? []);
  const totalLessons = allLessons.length;
  const totalDuration = allLessons.reduce((sum: number, l: any) => sum + (l.duration ?? 0), 0);

  const lessonsByType = allLessons.reduce(
    (acc: Record<string, number>, l: any) => {
      acc[l.type] = (acc[l.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const previewLessons = allLessons.filter((l: any) => l.isPreview).length;

  return (
    <div className="space-y-6">
      {/* ── Course Information ─────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Thông tin khóa học
        </h2>
        <Card>
          <CardContent className="p-5">
            <div className="flex gap-5">
              {course.thumbnail && (
                <div className="w-32 h-24 rounded-lg overflow-hidden bg-muted shrink-0 hidden sm:block">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold">{course.title}</h3>
                  {statusCfg && (
                    <Badge variant={statusCfg.variant} className={`${statusCfg.className} border-0 text-xs`}>
                      {statusCfg.label}
                    </Badge>
                  )}
                </div>

                {course.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {LEVEL_LABELS[course.level] ?? "—"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">{formatPrice(course.price)}</span>
                  </span>
                  {course.categories && course.categories.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      {course.categories.map((c: any) => c.name).join(", ")}
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/courses/${courseId}/edit`)}
                disabled={!editable}
                className="shrink-0 h-8"
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                {editable ? "Chỉnh sửa" : "Đang chờ duyệt"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Course Statistics ──────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Thống kê khóa học
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox icon={Layers} label="Chương" value={sections.length} />
          <StatBox icon={FileText} label="Bài học" value={totalLessons} />
          <StatBox icon={Clock} label="Thời lượng" value={formatDuration(totalDuration)} />
          <StatBox icon={Users} label="Học viên" value={course.totalStudents ?? 0} />
        </div>

        {/* Lesson type breakdown */}
        {totalLessons > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {Object.entries(lessonsByType).map(([type, count]) => {
              const Icon = LESSON_TYPE_ICONS[type] ?? FileText;
              return (
                <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="capitalize">{type}</span>
                  <span className="font-medium text-foreground">{count}</span>
                </div>
              );
            })}
            {previewLessons > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5" />
                <span>{previewLessons} bài miễn phí</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Curriculum Summary ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Chương trình học
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/courses/${courseId}/content`)}
            className="h-7 text-xs"
          >
            Xem nội dung
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            {sections.length > 0 ? (
              <div className="divide-y">
                {sections.map((section: any, idx: number) => {
                  const lessons = section.lessons ?? [];
                  const sectionDuration = lessons.reduce(
                    (sum: number, l: any) => sum + (l.duration ?? 0),
                    0,
                  );
                  return (
                    <div key={section.id ?? idx} className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground w-6 text-right shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{section.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {lessons.length} bài · {formatDuration(sectionDuration)}
                          </p>
                        </div>
                      </div>
                      {lessons.length > 0 && (
                        <div className="mt-2.5 ml-9 space-y-1.5">
                          {lessons.map((lesson: any) => {
                            const LIcon = LESSON_TYPE_ICONS[lesson.type] ?? FileText;
                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-2 text-xs text-muted-foreground"
                              >
                                <LIcon className="h-3 w-3 shrink-0" />
                                <span className="truncate flex-1">{lesson.title}</span>
                                {lesson.isPreview && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                                    Free
                                  </Badge>
                                )}
                                {lesson.duration != null && (
                                  <span className="shrink-0 tabular-nums">
                                    {formatDuration(lesson.duration)}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Chưa có chương trình học</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Nhấn "Chỉnh sửa" để thêm chương và bài học.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
