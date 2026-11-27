import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  User,
  CheckCircle,
  BookOpen,
  Play,
  Headphones,
  FileText,
  File,
  HelpCircle,
  Radio,
} from "lucide-react";
import { useStudentDetail, useStudentProgress, useStudentQuizAttempts, useStudentQuizAttemptDetail } from "@/features/students/hook/use-students";
import {
  ENROLLMENT_STATUS_LABELS,
  ENROLLMENT_STATUS_CLASSES,
} from "@/features/students/types/student";
import { LESSON_TYPE_LABELS } from "@/features/lessons/types/lesson.types";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Card, CardContent } from "@fe/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@fe/components/ui/dialog";
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
  const [selectedAttempt, setSelectedAttempt] = useState<string | null>(null);
  const { data: reviewData, isLoading: reviewLoading, isError: reviewError } = useStudentQuizAttemptDetail(id, selectedAttempt);
  const review = reviewData?.data ?? reviewData;

  const { data: detailData, isLoading: detailLoading } = useStudentDetail(id);
  const { data: progressData, isLoading: progressLoading } = useStudentProgress(id);

  const { data: quizData, isLoading: quizLoading, isError: quizError } = useStudentQuizAttempts(id);
  const quizAttempts = quizData?.data ?? quizData ?? [];
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

      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold">Lịch sử làm bài kiểm tra</h3>
          {quizLoading ? <Skeleton className="h-20 w-full" /> : quizError ? (
            <p className="text-sm text-destructive">Không thể tải lịch sử làm bài. Vui lòng thử lại sau.</p>
          ) : quizAttempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Học viên chưa nộp bài kiểm tra nào trong khóa học này.</p>
          ) : (
            <div className="overflow-x-auto"><table className="w-full text-sm text-left">
              <thead className="text-muted-foreground"><tr><th className="p-2">Bài kiểm tra</th><th className="p-2">Bài học</th><th className="p-2">Điểm</th><th className="p-2">Số câu đúng</th><th className="p-2">Kết quả</th><th className="p-2">Ngày nộp</th><th className="p-2">Chi tiết</th></tr></thead>
              <tbody>{quizAttempts.map((attempt: { id: string; quizTitle: string; lessonTitle: string; sectionTitle: string; score: string; correctCount: number; totalQuestions: number; passingScore: number; submittedAt: string }, index: number) => (
                <tr key={`${attempt.id}-${index}`} className="border-t"><td className="p-2 font-medium">{attempt.quizTitle}</td><td className="p-2">{attempt.lessonTitle}<div className="text-xs text-muted-foreground">{attempt.sectionTitle}</div></td><td className="p-2">{Number(attempt.score)}</td><td className="p-2">{attempt.correctCount}/{attempt.totalQuestions}</td><td className="p-2">{Number(attempt.score) >= Number(attempt.passingScore) ? "Đạt" : "Chưa đạt"}</td><td className="p-2 whitespace-nowrap">{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString("vi-VN") : "—"}</td><td className="p-2"><Button variant="outline" size="sm" onClick={() => setSelectedAttempt(String(attempt.id))}>Xem bài làm</Button></td></tr>
              ))}</tbody>
            </table></div>
          )}
        </CardContent>
      </Card>

      <Dialog open={selectedAttempt !== null} onOpenChange={(open) => { if (!open) setSelectedAttempt(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết bài làm{review?.quizTitle ? `: ${review.quizTitle}` : ""}</DialogTitle>
            <DialogDescription>Xem câu trả lời của học viên và đáp án đúng.</DialogDescription>
          </DialogHeader>
          {reviewLoading ? <Skeleton className="h-32 w-full" /> : reviewError ? <p className="text-sm text-destructive">Không thể tải chi tiết bài làm.</p> : review && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{review.correctCount}/{review.totalQuestions} câu đúng · {Number(review.score)} điểm</p>
              {review.questions.length === 0 && <p className="text-sm text-muted-foreground">Không còn dữ liệu câu trả lời để hiển thị.</p>}
              {review.questions.map((q: { id: string; question: string; isCorrect: boolean; selectedAnswer: string | null; correctAnswer: string | null; earnedPoints: number; points: number; explanation: string | null }, index: number) => (
                <div key={q.id} className="rounded-lg border p-4 space-y-2 text-sm">
                  <div className="flex items-start justify-between gap-3"><p className="font-semibold">Câu {index + 1}. {q.question}</p><Badge variant={q.isCorrect ? "default" : "destructive"}>{q.isCorrect ? "Đúng" : "Sai"}</Badge></div>
                  <p>Học viên trả lời: <span className="font-medium">{q.selectedAnswer || "Chưa trả lời"}</span></p>
                  <p>Đáp án đúng: <span className="font-medium">{q.correctAnswer || "Không có dữ liệu"}</span></p>
                  <p className="text-muted-foreground">Điểm: {q.earnedPoints}/{q.points}</p>
                  {q.explanation && <p className="text-muted-foreground">Giải thích: {q.explanation}</p>}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lesson Progress by Section */}
      {progressLoading ? (
        <Skeleton className="h-60 w-full" />
      ) : sections.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-semibold">Tiến độ từng bài học</h3>
          {sections.map((section: any) => {
            const sectionCompleted = section.lessons.filter((l: any) => l.isCompleted).length;
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
                    {section.lessons.map((lesson: any) => {
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
