import { useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Loader2,
  MessageSquare,
} from "lucide-react";

import { useGetCourses, useGetCourseDetail } from "@/features/courses/hook/use-courses";
import { useInstructorComments } from "@/features/lesson-comments/hooks/use-lesson-comments";
import {
  formatRelativeTime,
  initialsOf,
} from "@/features/lesson-comments/utils";
import type { CommentStatusFilter, InstructorCommentItem, CommentListMeta, CommentStats } from "@/features/lesson-comments/types/lesson-comments";
import { Button } from "@fe/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@fe/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@fe/components/ui/select";
import { cn } from "@fe/lib/utils";

// Sentinel "all" — Select của base-ui không nhận value rỗng.
const ALL = "all";

// getCourses chưa có type trả về → khai báo rõ phần trang này cần dùng
type CourseOption = { id: string | number; title: string };

interface CourseDetailShape {
  sections?: {
    id: string;
    title: string;
    lessons?: { id: string; title: string }[];
  }[];
}

type StatTone = "primary" | "amber" | "emerald";

const TONE_CLASS: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  amber: "bg-amber-500/10 text-amber-600",
  emerald: "bg-emerald-500/10 text-emerald-600",
};

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: typeof MessageSquare;
  tone: StatTone;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        active ? "border-primary ring-2 ring-primary/20" : "border-border",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
          TONE_CLASS[tone],
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-2xl font-bold tabular-nums">{value}</span>
        <span className="block text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </span>
    </button>
  );
}

export default function LessonCommentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Bộ lọc lưu trong URL → giữ nguyên khi mở chi tiết rồi quay lại.
  const status = (searchParams.get("status") ?? "") as "" | CommentStatusFilter;
  const courseId = searchParams.get("courseId") ?? "";
  const lessonId = searchParams.get("lessonId") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));

  const updateParams = (patch: Record<string, string>, keepPage = false) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!keepPage) next.delete("page"); // đổi bộ lọc → về trang 1
    setSearchParams(next);
  };

  const { data: courses, isLoading: coursesLoading } = useGetCourses({
    limit: 100,
  });
  const courseList: CourseOption[] = courses?.data ?? [];

  // Danh sách bài học của khóa đang chọn (cho bộ lọc bài học)
  const { data: courseDetail } = useGetCourseDetail(courseId || undefined);
  const course = (
    courseDetail as { data?: CourseDetailShape } | undefined
  )?.data;
  const lessonOptions = useMemo(
    () =>
      (course?.sections ?? []).flatMap((s) =>
        (s.lessons ?? []).map((l) => ({
          id: Number(l.id),
          title: l.title,
        })),
      ),
    [course],
  );

  const { data, isLoading, isFetching } = useInstructorComments({
    courseId: courseId ? Number(courseId) : undefined,
    lessonId: lessonId ? Number(lessonId) : undefined,
    status: status || undefined,
    page,
    limit: 10,
  });

  const items: InstructorCommentItem[] = data?.data ?? [];
  const stats: CommentStats | undefined = data?.stats;
  const meta: CommentListMeta | undefined = data?.meta;
  const hasFilter = Boolean(status || courseId || lessonId);

  const selectedCourseLabel = courseList.find(
    (c) => String(c.id) === courseId,
  )?.title;
  const selectedLessonLabel = lessonOptions.find(
    (l) => String(l.id) === lessonId,
  )?.title;

  const openDetail = (id: number) =>
    navigate(`/lesson-comments/${id}`, { state: { from: location.search } });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bình luận bài học
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo dõi câu hỏi của học viên trong từng bài học và trả lời trực tiếp
        </p>
      </div>

      {/* Thống kê — bấm vào để lọc theo trạng thái */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Tổng câu hỏi"
          value={stats?.total ?? 0}
          icon={MessageSquare}
          tone="primary"
          active={!status}
          onClick={() => updateParams({ status: "" })}
        />
        <StatCard
          label="Chưa trả lời"
          value={stats?.unanswered ?? 0}
          icon={CircleAlert}
          tone="amber"
          active={status === "unanswered"}
          onClick={() => updateParams({ status: "unanswered" })}
        />
        <StatCard
          label="Đã trả lời"
          value={stats?.answered ?? 0}
          icon={CheckCircle2}
          tone="emerald"
          active={status === "answered"}
          onClick={() => updateParams({ status: "answered" })}
        />
      </div>

      {/* Bộ lọc: trạng thái + khóa học + bài học */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm md:flex-row md:flex-wrap md:items-center">
        <Tabs
          value={status || ALL}
          onValueChange={(v) =>
            updateParams({ status: v === ALL ? "" : String(v) })
          }
        >
          <TabsList variant="line">
            <TabsTrigger value={ALL}>Tất cả</TabsTrigger>
            <TabsTrigger value="unanswered">Chưa trả lời</TabsTrigger>
            <TabsTrigger value="answered">Đã trả lời</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap md:ml-auto">
          <Select
            value={courseId || ALL}
            onValueChange={(v) =>
              updateParams({
                courseId: v === ALL ? "" : String(v),
                lessonId: "",
              })
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-[230px]">
              {coursesLoading
                ? "Đang tải khóa học..."
                : (selectedCourseLabel ?? "Tất cả khóa học")}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tất cả khóa học</SelectItem>
              {courseList.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={lessonId || ALL}
            onValueChange={(v) =>
              updateParams({ lessonId: v === ALL ? "" : String(v) })
            }
            disabled={!courseId}
          >
            <SelectTrigger className="h-9 w-full sm:w-[230px]">
              {!courseId
                ? "Chọn khóa trước"
                : (selectedLessonLabel ?? "Tất cả bài học")}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tất cả bài học</SelectItem>
              {lessonOptions.map((l) => (
                <SelectItem key={l.id} value={String(l.id)}>
                  {l.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Danh sách câu hỏi */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Đang tải bình luận...
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageSquare className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold">
            {hasFilter
              ? "Không tìm thấy bình luận phù hợp"
              : "Chưa có bình luận nào"}
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            {hasFilter
              ? "Thử đổi bộ lọc trạng thái, khóa học hoặc bài học."
              : "Khi học viên đặt câu hỏi trong bài học, bình luận sẽ hiển thị tại đây để bạn trả lời."}
          </p>
        </div>
      ) : (
        <div className={cn("space-y-3", isFetching && "opacity-70")}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openDetail(item.id)}
              className="group w-full rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {initialsOf(item.user?.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">
                      {item.user?.name ?? "Học viên"}
                    </span>
                    {item.answered ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã trả lời
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600">
                        <CircleAlert className="h-3 w-3" />
                        Chưa trả lời
                      </span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>

                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {item.content}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                    <span className="inline-flex min-w-0 items-center gap-1 text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate font-medium">
                        {item.courseTitle}
                      </span>
                      <span className="text-border">›</span>
                      {/* Link sang bài gốc đang hỏi — stopPropagation để không mở nhầm trang chi tiết */}
                      <a
                        href={`/lessons/${item.lessonId}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Mở bài học trong tab mới"
                        onClick={(e) => e.stopPropagation()}
                        className="truncate font-medium text-primary hover:underline"
                      >
                        {item.lessonTitle}
                      </a>
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary">
                      {item.replyCount} trả lời
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Xem chi tiết
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Phân trang */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Trang {meta.page}/{meta.totalPages} · {meta.total} câu hỏi
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) }, true)}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => updateParams({ page: String(page + 1) }, true)}
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
