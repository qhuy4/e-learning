import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardList,
  ListChecks,
  Loader2,
  Lock,
  PencilLine,
  RotateCcw,
  Send,
  Target,
  Timer,
} from 'lucide-react';
import { Button } from '@fe/components/ui/button';
import { AlertDialog, AlertDialogPopup, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@fe/components/ui/alert-dialog';
import { cn } from '@fe/lib/utils';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useUpdateLessonProgress } from '@/features/learning/hooks/use-learning';
import { useLessonQuizzes, useQuizAttemptHistory, useQuizAttemptReview, useStartQuiz, useSubmitQuiz } from '../hooks/use-quiz';
import { getErrorMessage, getErrorStatus } from '../services/quiz.service';
import type { LessonQuiz, QuizAttemptResult, QuizQuestion } from '../types/quiz.type';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  TRUE_FALSE: 'Đúng / Sai',
  FILL_BLANK: 'Điền vào chỗ trống',
};

const CARD_SHADOW = 'shadow-[0_4px_20px_rgba(15,23,42,0.06)]';

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const formatClock = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const isAnsweredQuestion = (q: QuizQuestion, sel: Record<string, string>, txt: Record<string, string>): boolean => {
  if (q.type === 'FILL_BLANK') return (txt[String(q.id)] ?? '').trim().length > 0;
  return !!sel[String(q.id)];
};

interface QuizLessonProps {
  lessonId: number;
  /** Quiz được chọn từ sidebar; mở thẳng trang giới thiệu của quiz đó. */
  initialQuizId?: number;
  /** Dùng để đánh dấu hoàn thành bài học khi đạt (PATCH /lesson-progress). */
  courseId?: number;
  /** Điều hướng sang bài tiếp theo (nếu có). */
  onNextLesson?: () => void;
  className?: string;
}

type View = 'list' | 'intro' | 'taking' | 'result';

export const QuizLesson = ({ lessonId, initialQuizId, courseId, onNextLesson, className }: QuizLessonProps) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: quizzes, isLoading, isError, error, refetch } = useLessonQuizzes(
    lessonId,
    isAuthenticated,
  );

  const [view, setView] = useState<View>('list');
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<LessonQuiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [txt, setTxt] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const startMutation = useStartQuiz();
  const submitMutation = useSubmitQuiz();
  const updateProgress = useUpdateLessonProgress();
  const [reviewAttemptId, setReviewAttemptId] = useState<string | number | undefined>();
  const historyQuizId = selectedQuizId ?? (quizzes?.length === 1 ? quizzes[0].id : undefined);
  const { data: attemptHistory = [] } = useQuizAttemptHistory(historyQuizId, isAuthenticated);
  const { data: attemptReview, isLoading: isReviewLoading } = useQuizAttemptReview(
    reviewAttemptId,
    isAuthenticated,
  );

  // Quiz hiện tại — ưu tiên bản mới nhất từ server (attemptsUsed đã được refetch).
  const freshQuiz = useMemo(
    () => quizzes?.find((q) => q.id === activeQuiz?.id) ?? activeQuiz,
    [quizzes, activeQuiz],
  );

  // Nhiều quiz → tách thành danh sách chọn từng quiz một (tránh 2 intro xếp chồng).
  const isMultiQuiz = (quizzes?.length ?? 0) > 1;
  const introQuiz = useMemo(
    () => (isMultiQuiz ? quizzes?.find((q) => q.id === selectedQuizId) ?? null : quizzes?.[0] ?? null),
    [isMultiQuiz, quizzes, selectedQuizId],
  );

  // Chuyển sang lesson khác → về trạng thái ban đầu.
  useEffect(() => {
    setView('list');
    setSelectedQuizId(null);
    setActiveQuiz(null);
    setResult(null);
    setFormError(null);
    setAttemptId(null);
  }, [lessonId, initialQuizId]);

  useEffect(() => {
    if (initialQuizId) {
      setSelectedQuizId(initialQuizId);
      setView('intro');
    }
  }, [initialQuizId]);

  const answeredCount = useMemo(
    () => questions.filter((q) => isAnsweredQuestion(q, sel, txt)).length,
    [questions, sel, txt],
  );

  // ── Bắt đầu làm bài ────────────────────────────────────────────────────────
  const handleStart = async (quiz: LessonQuiz) => {
    if (startMutation.isPending) return;
    setFormError(null);
    try {
      const attempt = await startMutation.mutateAsync(quiz.id);
      const displayQuestions = (
        quiz.shuffleQuestions ? shuffle(quiz.questions) : [...quiz.questions]
      ).map((q) =>
        quiz.shuffleOptions && q.options.length > 1 ? { ...q, options: shuffle(q.options) } : q,
      );
      setActiveQuiz(quiz);
      setQuestions(displayQuestions);
      setAttemptId(String(attempt.id));
      setSel({});
      setTxt({});
      setCurrent(0);
      setRemaining(quiz.timeLimit ? quiz.timeLimit * 60 : null);
      setResult(null);
      setTimedOut(false);
      setView('taking');
    } catch (e) {
      setFormError(getErrorMessage(e, 'Không thể bắt đầu bài kiểm tra. Vui lòng thử lại.'));
    }
  };

  // ── Nộp bài ────────────────────────────────────────────────────────────────
  const buildAnswers = () =>
    questions.map((q) => {
      if (q.type === 'FILL_BLANK') {
        return {
          questionId: String(q.id),
          answerText: (txt[String(q.id)] ?? '').trim(),
        };
      }
      const optionId = sel[String(q.id)];
      return optionId
        ? { questionId: String(q.id), selectedOptionId: optionId }
        : { questionId: String(q.id) };
    });

  const doSubmit = (auto = false) => {
    if (!attemptId || submitMutation.isPending) return;
    setConfirmSubmit(false);
    setFormError(null);
    setTimedOut(auto);
    submitMutation.mutate(
      { attemptId, answers: buildAnswers() },
      {
        onSuccess: (attempt) => {
          setResult(attempt);
          setView('result');
          queryClient.invalidateQueries({ queryKey: ['lesson-quizzes', lessonId] });
          queryClient.invalidateQueries({ queryKey: ['quiz-attempt-history'] });
          // Đạt điểm đạt → đánh dấu bài học hoàn thành (API progress có sẵn).
          const passed = Number(attempt.score ?? 0) >= (activeQuiz?.passingScore ?? 0);
          if (passed && courseId) {
            updateProgress.mutate({
              courseId,
              lessonId,
              watchSeconds: 0,
              progressPercent: 100,
            });
          }
        },
        onError: (e) => {
          setTimedOut(false);
          setFormError(getErrorMessage(e, 'Nộp bài thất bại. Vui lòng thử lại.'));
        },
      },
    );
  };

  // Ref để bộ đếm giờ tự nộp bài luôn gọi bản mới nhất của doSubmit.
  const doSubmitRef = useRef<(auto?: boolean) => void>(() => {});
  useEffect(() => {
    doSubmitRef.current = doSubmit;
  });

  // ── Bộ đếm giờ ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'taking' || remaining === null) return;
    if (remaining <= 0) {
      doSubmitRef.current(true);
      return;
    }
    const timer = window.setTimeout(
      () => setRemaining((r) => (r === null ? r : Math.max(0, r - 1))),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [view, remaining]);

  const shell = cn('px-4 py-4 md:px-6 md:py-6', className);

  // ── Chưa đăng nhập ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className={shell}>
        <div className={cn('rounded-2xl border border-slate-200 bg-white p-8 text-center md:p-10', CARD_SHADOW)}>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <Lock className="h-6 w-6 text-slate-400" />
          </span>
          <h3 className="mt-4 text-lg font-bold text-slate-900">Đăng nhập để làm bài kiểm tra</h3>
          <p className="mt-1 text-sm text-slate-500">
            Đăng nhập bằng tài khoản học viên để bắt đầu làm bài.
          </p>
        </div>
      </div>
    );
  }

  // ── Đang tải ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={shell}>
        <div className={cn('rounded-2xl border border-slate-200 bg-white p-8 md:p-10', CARD_SHADOW)}>
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-6 w-2/3 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-4 w-1/2 animate-pulse rounded-lg bg-slate-100" />
            <div className="mt-2 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
            <div className="mt-2 h-12 w-56 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  // ── Lỗi tải (chỉ khi chưa có dữ liệu — refetch lỗi nền vẫn hiển thị data cũ) ──
  if (isError && (!quizzes || quizzes.length === 0)) {
    const status = getErrorStatus(error);
    return (
      <div className={shell}>
        <div className={cn('rounded-2xl border border-slate-200 bg-white p-8 text-center md:p-10', CARD_SHADOW)}>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </span>
          <h3 className="mt-4 text-lg font-bold text-slate-900">Không thể tải bài kiểm tra</h3>
          <p className="mt-1 text-sm text-slate-500">
            {status === 403
              ? 'Chỉ tài khoản học viên mới có thể làm bài kiểm tra.'
              : getErrorMessage(error, 'Đã có lỗi xảy ra. Vui lòng thử lại.')}
          </p>
          <Button
            variant="outline"
            className="mt-5 h-10 rounded-xl px-5 font-semibold"
            onClick={() => refetch()}
          >
            <RotateCcw /> Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // ── Không có quiz ──────────────────────────────────────────────────────────
  if (!quizzes || quizzes.length === 0) {
    return (
      <div className={shell}>
        <div className={cn('rounded-2xl border border-slate-200 bg-white p-8 text-center md:p-10', CARD_SHADOW)}>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <ClipboardList className="h-6 w-6 text-slate-400" />
          </span>
          <h3 className="mt-4 text-lg font-bold text-slate-900">Bài kiểm tra chưa có câu hỏi</h3>
          <p className="mt-1 text-sm text-slate-500">
            Giảng viên chưa thêm câu hỏi cho bài học này. Hãy quay lại sau nhé!
          </p>
        </div>
      </div>
    );
  }

  // ── Màn kết quả ────────────────────────────────────────────────────────────
  if (view === 'result' && result && freshQuiz) {
    const score = Number(result.score ?? 0);
    const totalQuestions = result.totalQuestions || questions.length;
    const percent =
      totalQuestions > 0 ? Math.round((result.correctCount / totalQuestions) * 100) : 0;
    const hasBar = freshQuiz.passingScore > 0;
    const passed = score >= freshQuiz.passingScore;
    const attemptsUsedNow = Math.max(
      freshQuiz.attemptsUsed,
      (activeQuiz?.attemptsUsed ?? 0) + 1,
    );
    const attemptsLeft = true;

    return (
      <div className={shell}>
        <div className={cn('rounded-2xl border border-slate-200 bg-white', CARD_SHADOW)}>
          <div className="flex flex-col items-center px-5 py-10 text-center md:px-10 md:py-14">
            <div
              className={cn(
                'flex h-20 w-20 animate-in zoom-in-95 items-center justify-center rounded-full',
                passed
                  ? 'bg-emerald-50 text-emerald-500 ring-8 ring-emerald-100'
                  : 'bg-amber-50 text-amber-500 ring-8 ring-amber-100',
              )}
            >
              {passed ? (
                <CheckCircle2 className="h-10 w-10" />
              ) : (
                <AlertTriangle className="h-10 w-10" />
              )}
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900 md:text-3xl">
              {!hasBar
                ? 'Nộp bài thành công!'
                : passed
                  ? 'Chúc mừng! Bạn đã đạt bài kiểm tra'
                  : 'Chưa đạt điểm yêu cầu'}
            </h2>
            <p className="mt-2 max-w-md text-slate-500">
              {!hasBar
                ? 'Kết quả bài làm của bạn đã được lưu lại.'
                : passed
                  ? 'Bạn đã vượt qua điểm đạt của bài kiểm tra.'
                  : `Bạn cần đạt từ ${freshQuiz.passingScore} điểm. Hãy thử lại nhé!`}
            </p>

            {timedOut && (
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-600">
                <Timer className="h-3.5 w-3.5" /> Hết thời gian — hệ thống đã tự động nộp bài
              </span>
            )}

            <div className="mt-7 grid w-full max-w-lg grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4">
                <p className="text-2xl font-extrabold text-slate-900">
                  {result.correctCount}
                  <span className="text-base font-bold text-slate-400">/{totalQuestions}</span>
                </p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">Câu đúng</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4">
                <p className="text-2xl font-extrabold text-slate-900">{percent}%</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">Tỷ lệ</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4">
                <p className="text-2xl font-extrabold text-piemind-pink">{score}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">Điểm</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {hasBar && (
                <span
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-bold',
                    passed
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                      : 'border-amber-200 bg-amber-50 text-amber-600',
                  )}
                >
                  {passed ? 'Đạt' : 'Chưa đạt'} · Điểm đạt {freshQuiz.passingScore}
                </span>
              )}
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                Lần làm bài {attemptsUsedNow}
              </span>
              {updateProgress.isSuccess && passed && (
                <span className="rounded-full border border-piemind-mint/40 bg-piemind-mint/10 px-3 py-1 text-xs font-bold text-emerald-600">
                  Đã hoàn thành bài học
                </span>
              )}
            </div>

            {freshQuiz.showAnswerAfterSubmit && (
              <div className="mt-5 w-full max-w-lg text-left">
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-2 border-slate-200 font-bold text-slate-700"
                  onClick={() => setReviewAttemptId(result.id)}
                >
                  <ListChecks /> Xem đáp án đúng / sai
                </Button>
                {reviewAttemptId === result.id && (
                  <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    {isReviewLoading ? (
                      <p className="text-center text-sm text-slate-500">Đang tải đáp án...</p>
                    ) : (
                      attemptReview?.questions.map((question, questionIndex) => (
                        <div key={question.id} className={cn('rounded-xl border bg-white p-3', question.isCorrect ? 'border-emerald-200' : 'border-rose-200')}>
                          <p className="text-sm font-bold text-slate-800">Câu {questionIndex + 1}: {question.question}</p>
                          <p className="mt-1 text-xs text-slate-600">Bạn chọn: <strong>{question.selectedAnswer ?? 'Chưa trả lời'}</strong></p>
                          {!question.isCorrect && <p className="mt-1 text-xs text-emerald-700">Đáp án đúng: <strong>{question.correctAnswer ?? '—'}</strong></p>}
                          <p className={cn('mt-1 text-xs font-bold', question.isCorrect ? 'text-emerald-700' : 'text-rose-700')}>
                            {question.isCorrect ? 'Đúng' : 'Sai'} · {question.earnedPoints} điểm
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              {isMultiQuiz && (
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-2 border-slate-200 px-6 font-bold text-slate-700"
                  onClick={() => {
                    setView('list');
                    setSelectedQuizId(null);
                    setResult(null);
                    setFormError(null);
                  }}
                >
                  <ArrowLeft /> Chọn quiz khác
                </Button>
              )}
              {attemptsLeft && (
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-2 border-slate-200 px-6 font-bold text-slate-700"
                  disabled={startMutation.isPending}
                  onClick={() => freshQuiz && handleStart(freshQuiz)}
                >
                  {startMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <RotateCcw />
                  )}{' '}
                  Làm lại
                </Button>
              )}
              {onNextLesson && (
                <Button
                  className="h-11 rounded-xl px-7 text-base font-bold shadow-[0_4px_16px_rgba(243,129,129,0.3)]"
                  onClick={onNextLesson}
                >
                  Tiếp tục học <ArrowRight />
                </Button>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── Màn đang làm bài ───────────────────────────────────────────────────────
  if (view === 'taking' && activeQuiz) {
    const question = questions[current];
    return (
      <div className={shell}>
        <AlertDialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
          <AlertDialogPopup>
            <AlertDialogTitle>Xác nhận nộp bài</AlertDialogTitle>
            <AlertDialogDescription>
              {questions.length - answeredCount > 0
                ? `Bạn còn ${questions.length - answeredCount} câu chưa trả lời. Bạn có muốn nộp bài không?`
                : 'Bạn đã trả lời tất cả câu hỏi. Bạn có muốn nộp bài không?'}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setConfirmSubmit(false)}>Tiếp tục làm bài</Button>
              <Button onClick={() => doSubmit()} disabled={submitMutation.isPending}>Nộp bài</Button>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialog>
        <div className={cn('overflow-hidden rounded-2xl border border-slate-200 bg-white', CARD_SHADOW)}>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3.5 md:px-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-piemind-pink/10 text-piemind-pink">
                <ClipboardList className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{activeQuiz.title}</p>
                <p className="text-xs text-slate-500">
                  Câu {current + 1}/{questions.length} · Đã trả lời {answeredCount}/
                  {questions.length}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              {remaining !== null && (
                <span
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-sm font-bold',
                    remaining <= 60
                      ? 'animate-pulse border-amber-300 bg-amber-50 text-amber-600'
                      : 'border-slate-200 bg-white text-slate-700',
                  )}
                >
                  <Timer className="h-4 w-4" /> {formatClock(remaining)}
                </span>
              )}
              <Button
                className="h-9 rounded-xl px-4 text-sm font-bold"
                disabled={submitMutation.isPending}
                onClick={() => setConfirmSubmit(true)}
              >
                {submitMutation.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Send />
                )}{' '}
                Nộp bài
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-6 md:px-6">
            {formError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-600">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            {question && (
              <div className="rounded-xl border border-slate-200 p-4 md:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-piemind-pink/10 px-3 py-1 text-xs font-bold text-piemind-pink">
                    Câu {current + 1}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    {TYPE_LABELS[question.type] ?? 'Trắc nghiệm'}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    {question.points} điểm
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-line text-base font-semibold leading-relaxed text-slate-900 md:text-lg">
                  {question.question}
                </p>

                {question.imageUrl && (
                  <img
                    src={question.imageUrl}
                    alt="Hình minh họa"
                    className="mt-4 max-h-72 w-full rounded-xl border border-slate-200 bg-slate-50 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                {question.audioUrl && (
                  <audio controls preload="metadata" src={question.audioUrl} className="mt-4 w-full">
                    Trình duyệt của bạn không hỗ trợ phát âm thanh.
                  </audio>
                )}

                {question.type === 'FILL_BLANK' ? (
                  <div className="mt-5">
                    <input
                      value={txt[String(question.id)] ?? ''}
                      onChange={(e) =>
                        setTxt((prev) => ({ ...prev, [String(question.id)]: e.target.value }))
                      }
                      placeholder="Nhập đáp án của bạn..."
                      className="h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-medium text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-piemind-pink focus:ring-2 focus:ring-piemind-pink/25"
                    />
                    <p className="mt-2 text-xs text-slate-400">
                      Điền chính xác nội dung đáp án (không phân biệt hoa/thường).
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 flex flex-col gap-2.5">
                    {question.options.map((opt, idx) => {
                      const selected = sel[String(question.id)] === String(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setSel((prev) => ({
                              ...prev,
                              [String(question.id)]: String(opt.id),
                            }))
                          }
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all',
                            selected
                              ? 'border-piemind-pink bg-piemind-pink/[0.06] shadow-[0_4px_16px_rgba(243,129,129,0.15)]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                          )}
                        >
                          <span
                            className={cn(
                              'grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs font-bold',
                              selected
                                ? 'border-piemind-pink bg-piemind-pink text-white'
                                : 'border-slate-300 text-slate-400',
                            )}
                          >
                            {LETTERS[idx] ?? idx + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-800 md:text-base">
                            {opt.content}
                          </span>
                        </button>
                      );
                    })}
                    {question.options.length === 0 && (
                      <p className="text-sm text-slate-400">Câu hỏi chưa có phương án trả lời.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft /> Trước
            </button>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {questions.map((q, i) => {
                const answered = isAnsweredQuestion(q, sel, txt);
                return (
                  <button
                    key={q.id}
                    type="button"
                    aria-label={`Câu ${i + 1}`}
                    onClick={() => setCurrent(i)}
                    className={cn(
                      'h-8 w-8 rounded-lg text-xs font-bold transition',
                      answered
                        ? 'bg-piemind-pink text-white hover:bg-piemind-pink/90'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                      i === current && 'ring-2 ring-slate-900 ring-offset-1',
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={current >= questions.length - 1}
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau <ArrowRight />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Danh sách quiz (nhiều quiz → chọn từng cái riêng biệt) ─────────────────
  if (view === 'list' && isMultiQuiz) {
    return (
      <div className={shell}>
        <div className={cn('overflow-hidden rounded-2xl border border-slate-200 bg-white', CARD_SHADOW)}>
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 md:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-piemind-pink/10 text-piemind-pink">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold text-slate-900">Bài kiểm tra</h2>
                <p className="text-sm text-slate-500">
                  Bài học này có {quizzes.length} quiz — chọn một quiz để bắt đầu.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {quizzes.map((quiz, index) => {
              const exhausted = false;
              const noQuestions = quiz.questions.length === 0;
              const disabled = exhausted || noQuestions;

              return (
                <button
                  key={quiz.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setSelectedQuizId(quiz.id);
                    setFormError(null);
                    setView('intro');
                  }}
                  className={cn(
                    'group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors md:px-8 md:py-5',
                    disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-piemind-pink/[0.04]',
                  )}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-sm font-extrabold tabular-nums text-slate-500 transition-colors group-hover:bg-piemind-pink group-hover:text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-bold text-slate-900 md:text-base">
                        {quiz.title}
                      </span>
                      {exhausted && (
                        <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                          Hết lượt
                        </span>
                      )}
                      {!exhausted && quiz.attemptsUsed > 0 && (
                        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                          Đã làm {quiz.attemptsUsed} lần
                        </span>
                      )}
                    </span>
                    {quiz.description && (
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {quiz.description}
                      </span>
                    )}
                    <span className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">
                        {quiz.questions.length} câu
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">
                        {quiz.timeLimit ? `${quiz.timeLimit} phút` : 'Không giới hạn'}
                      </span>
                      {quiz.passingScore > 0 && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
                          Đạt từ {quiz.passingScore} điểm
                        </span>
                      )}
                    </span>
                  </span>

                  {!disabled && (
                    <span className="shrink-0 rounded-xl border-2 border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 transition-colors group-hover:border-piemind-pink group-hover:bg-piemind-pink group-hover:text-white md:text-sm">
                      {quiz.attemptsUsed > 0 ? 'Làm lại' : 'Bắt đầu'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {formError && (
            <div className="border-t border-slate-100 px-5 py-3 text-center text-sm font-medium text-rose-600 md:px-8">
              {formError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Màn giới thiệu 1 quiz ──────────────────────────────────────────────────
  const quiz = introQuiz;

  if (!quiz) {
    return (
      <div className={shell}>
        <div className={cn('rounded-2xl border border-slate-200 bg-white p-8 text-center md:p-10', CARD_SHADOW)}>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <ClipboardList className="h-6 w-6 text-slate-400" />
          </span>
          <h3 className="mt-4 text-lg font-bold text-slate-900">Không tìm thấy bài kiểm tra</h3>
          <p className="mt-1 text-sm text-slate-500">Quiz này không còn khả dụng.</p>
          {isMultiQuiz && (
            <Button
              variant="outline"
              className="mt-5 h-10 rounded-xl px-5 font-semibold"
              onClick={() => {
                setSelectedQuizId(null);
                setView('list');
              }}
            >
              <ArrowLeft /> Quay lại danh sách
            </Button>
          )}
        </div>
      </div>
    );
  }

  {
    // Học viên có thể làm lại để luyện tập; lịch sử lưu riêng từng lần nộp.
    const exhausted = false;
    const noQuestions = quiz.questions.length === 0;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const stats = [
      { icon: ListChecks, label: 'Câu hỏi', value: `${quiz.questions.length} câu` },
      { icon: Target, label: 'Tổng điểm', value: `${totalPoints} điểm` },
      {
        icon: Timer,
        label: 'Thời gian',
        value: quiz.timeLimit ? `${quiz.timeLimit} phút` : 'Không giới hạn',
      },
      {
        icon: Award,
        label: 'Lượt làm bài',
        value: `${quiz.attemptsUsed} lần`,
      },
    ];

    return (
      <div className={shell}>
        <div className="flex flex-col gap-4">
          {formError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-center text-sm font-medium text-rose-600">
              {formError}
            </p>
          )}
          <div className={cn('rounded-2xl border border-slate-200 bg-white', CARD_SHADOW)}>
            {isMultiQuiz && (
              <div className="border-b border-slate-100 px-5 py-3 md:px-8">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuizId(null);
                    setFormError(null);
                    setView('list');
                  }}
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-piemind-pink"
                >
                  <ArrowLeft className="h-4 w-4" /> Quay lại danh sách quiz
                </button>
              </div>
            )}
            <div className="px-5 py-8 md:px-10 md:py-10">
              <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-piemind-pink/25 bg-piemind-pink/10">
                  <ClipboardList className="h-8 w-8 text-piemind-pink" />
                </span>

                <h2 className="mt-4 text-xl font-bold text-slate-900 md:text-2xl">{quiz.title}</h2>
                {quiz.description && (
                  <p className="mt-2 text-sm text-slate-500 md:text-base">{quiz.description}</p>
                )}

                <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3.5"
                    >
                      <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white text-piemind-pink shadow-sm">
                        <stat.icon className="h-4 w-4" />
                      </span>
                      <p className="mt-2 truncate text-sm font-extrabold text-slate-900">
                        {stat.value}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {quiz.passingScore > 0 && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                      Đạt từ {quiz.passingScore} điểm
                    </span>
                  )}
                  {quiz.attemptsUsed > 0 && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                      Đã làm {quiz.attemptsUsed} lần
                    </span>
                  )}
                </div>

                <div className="mt-6 w-full max-w-xs">
                  <Button
                    className="h-12 w-full rounded-xl text-base font-bold shadow-[0_4px_16px_rgba(243,129,129,0.3)]"
                    disabled={startMutation.isPending || exhausted || noQuestions}
                    onClick={() => handleStart(quiz)}
                  >
                    {startMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <PencilLine />
                    )}
                    {quiz.attemptsUsed > 0 ? 'Làm lại' : 'Bắt đầu làm bài'}
                  </Button>
                </div>

                {attemptHistory.length > 0 && (
                  <div className="mt-7 w-full border-t border-slate-100 pt-5 text-left">
                    <h3 className="text-sm font-extrabold text-slate-800">Lịch sử làm bài</h3>
                    <div className="mt-3 space-y-2">
                      {attemptHistory.map((attempt, index) => (
                        <div key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs">
                          <span className="font-bold text-slate-700">Lần {attemptHistory.length - index}</span>
                          <span className="font-semibold text-slate-500">{attempt.correctCount}/{attempt.totalQuestions} câu · {attempt.score} điểm</span>
                          <span className={cn('rounded-full px-2 py-0.5 font-bold', attempt.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
                            {attempt.passed ? 'Đạt' : 'Chưa đạt'}
                          </span>
                          {quiz.showAnswerAfterSubmit && (
                            <button
                              type="button"
                              onClick={() => setReviewAttemptId(attempt.id)}
                              className="font-bold text-piemind-pink hover:underline"
                            >
                              Xem đáp án
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {reviewAttemptId && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <p className="mb-3 text-sm font-extrabold text-slate-800">Xem lại câu trả lời</p>
                        {isReviewLoading ? (
                          <p className="text-xs text-slate-500">Đang tải đáp án...</p>
                        ) : (
                          <div className="space-y-3">
                            {attemptReview?.questions.map((question, questionIndex) => (
                              <div key={question.id} className={cn('rounded-xl border p-3', question.isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50')}>
                                <p className="text-xs font-bold text-slate-800">Câu {questionIndex + 1}: {question.question}</p>
                                <p className="mt-1 text-xs text-slate-600">Bạn chọn: <strong>{question.selectedAnswer ?? 'Chưa trả lời'}</strong></p>
                                {!question.isCorrect && <p className="mt-1 text-xs text-emerald-700">Đáp án đúng: <strong>{question.correctAnswer ?? '—'}</strong></p>}
                                <p className={cn('mt-1 text-xs font-bold', question.isCorrect ? 'text-emerald-700' : 'text-rose-700')}>
                                  {question.isCorrect ? 'Đúng' : 'Sai'} · {question.earnedPoints} điểm
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {noQuestions && (
                  <p className="mt-3 text-sm font-medium text-amber-600">
                    Bài kiểm tra chưa có câu hỏi.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
