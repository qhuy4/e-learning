import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  BookOpen,
  Play,
  Headphones,
  FileText,
  File,
  HelpCircle,
  Radio,
} from "lucide-react";
import { useStudentDetail, useStudentProgress } from "@/features/students/hook/use-students";
import {
  ENROLLMENT_STATUS_LABELS,
  ENROLLMENT_STATUS_CLASSES,
} from "@/features/students/types/student";
import { LESSON_TYPE_LABELS } from "@/features/lessons/types/lesson.types";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Card, CardContent } from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";

const LESSON_TYPE_ICONS: Record<string, typeof Play> = {
  video: Play,
  audio: Headphones,
  text: FileText,
  document: File,
  quiz: HelpCircle,
  live: Radio,
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

export default function StudentDetailPage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();
  const id = Number(enrollmentId);

  const { data: detailData, isLoading: detailLoading } = useStudentDetail(id);
  const { data: progressData, isLoading: progressLoading } = useStudentProgress(id);

  const detail = detailData?.data ?? detailData;
  const progress = progressData?.data ?? progressData;

  if (detailLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy thông tin học viên.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/students")}>
          Quay lại
        </Button>
      </div>
    );
  }

  const summary = progress?.summary;
  const sections = progress?.sections ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{detail.userName}</h1>
          <p className="text-muted-foreground">{detail.userEmail}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Student Info */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Thông tin học viên
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Họ tên</p>
                <p className="font-medium">{detail.userName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{detail.userEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Trạng thái</p>
                <Badge className={ENROLLMENT_STATUS_CLASSES[detail.status] ?? ""}>
                  {ENROLLMENT_STATUS_LABELS[detail.status] ?? "Không rõ"}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Ngày đăng ký</p>
                <p className="font-medium">
                  {detail.enrolledAt
                    ? new Date(detail.enrolledAt).toLocaleDateString("vi-VN")
                    : "—"}
                </p>
              </div>
              {detail.lastAccessedAt && (
                <div>
                  <p className="text-muted-foreground">Truy cập gần nhất</p>
                  <p className="font-medium">
                    {new Date(detail.lastAccessedAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}
              {detail.completedAt && (
                <div>
                  <p className="text-muted-foreground">Ngày hoàn thành</p>
                  <p className="font-medium">
                    {new Date(detail.completedAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Course Info */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Khóa học
            </h3>
            <div className="flex items-center gap-3">
              {detail.courseThumbnail && (
                <img
                  src={detail.courseThumbnail}
                  alt={detail.courseTitle}
                  className="h-14 w-20 rounded object-cover"
                />
              )}
              <div>
                <Link
                  to={`/courses/${detail.courseId}`}
                  className="font-medium hover:underline"
                >
                  {detail.courseTitle}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${detail.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{detail.progress}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{summary.totalLessons}</p>
              <p className="text-xs text-muted-foreground">Tổng bài học</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{summary.completedLessons}</p>
              <p className="text-xs text-muted-foreground">Đã hoàn thành</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{summary.completionPercent}%</p>
              <p className="text-xs text-muted-foreground">Tiến độ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{summary.totalWatchHours}h</p>
              <p className="text-xs text-muted-foreground">Thời gian học</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lesson Progress by Section */}
      {progressLoading ? (
        <Skeleton className="h-60 w-full" />
      ) : sections.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-semibold">Tiến độ từng bài học</h3>
          {sections.map((section) => {
            const sectionCompleted = section.lessons.filter((l) => l.isCompleted).length;
            return (
              <Card key={section.sectionId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm">
                      {section.sectionTitle}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {sectionCompleted}/{section.lessons.length} bài
                    </span>
                  </div>
                  <div className="space-y-2">
                    {section.lessons.map((lesson) => {
                      const Icon = LESSON_TYPE_ICONS[lesson.lessonType] ?? BookOpen;
                      return (
                        <div
                          key={lesson.lessonId}
                          className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/50"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {lesson.lessonTitle}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{LESSON_TYPE_LABELS[lesson.lessonType as keyof typeof LESSON_TYPE_LABELS] ?? lesson.lessonType}</span>
                              {lesson.lessonDuration > 0 && (
                                <>
                                  <span>·</span>
                                  <span>{formatDuration(lesson.lessonDuration)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {lesson.watchSeconds > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {formatDuration(lesson.watchSeconds)}
                              </span>
                            )}
                            <div className="w-16">
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${lesson.progressPercent}%`,
                                    backgroundColor:
                                      lesson.progressPercent >= 100
                                        ? "hsl(var(--emerald-600))"
                                        : lesson.progressPercent > 0
                                          ? "hsl(var(--primary))"
                                          : "transparent",
                                  }}
                                />
                              </div>
                            </div>
                            {lesson.isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <span className="text-xs text-muted-foreground w-8 text-right">
                                {lesson.progressPercent}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Chưa có dữ liệu tiến độ học tập.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
