import { useState, useEffect, useRef } from 'react';
import { useParams, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LearningHeader,
  VideoPlayer,
  LearningTabs,
  LearningSidebar,
  formatSectionLabel,
  type VideoPlayerHandle,
} from '../../features/learning/components/LearningPlayer';
import { useLearningCourse, useLessonBySlug, usePreviewLesson, useCourseProgress } from '../../features/learning/hooks/use-learning';
import { usePreviewCourse } from '../../features/courses/hooks/use-courses';
import { useEnrollmentCheck } from '../../features/enrollment/hooks/use-enrollment';
import { useAuth } from '../../features/auth/hooks/use-auth';
import { useVideoProgress } from '../../features/learning/hooks/use-video-progress';
import { QuizLesson } from '../../features/quizzes/components/QuizLesson';
import { QuizLauncher } from '../../features/quizzes/components/QuizLauncher';
import { useCourseLessonQuizzes, useLessonQuizzes } from '../../features/quizzes/hooks/use-quiz';
import { ArrowLeft, ClipboardList, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  buildSequentialLocks,
  getLessonLockMessage,
  LOCK_MESSAGES,
} from '../../features/learning/utils/lesson-lock';

const INSTRUCTOR_URL =
  import.meta.env.VITE_INSTRUCTOR_URL ?? 'http://localhost:5175';

export const LearningPage = () => {
  const { courseSlug, lessonSlug } = useParams<{ courseSlug: string; lessonSlug?: string }>();
  const [searchParams] = useSearchParams();
  const previewToken = searchParams.get('previewToken');
  const requestedQuizId = Number(searchParams.get('quiz')) || undefined;

  // Quiz mở ở giao diện RIÊNG toàn màn hình (không nhúng inline).
  const [quizOpen, setQuizOpen] = useState(false);

  const regularCourseQuery = useLearningCourse(courseSlug);
  const previewCourseQuery = usePreviewCourse(previewToken ?? '');
  
  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = previewToken ? previewCourseQuery : regularCourseQuery;

  const courseData = course;
  const defaultLessonSlug = courseData?.sections?.flatMap((s: any) => s.lessons || [])[0]?.slug;
  const targetLessonSlug = lessonSlug || defaultLessonSlug;

  const { isAuthenticated } = useAuth();
  const { data: enrollmentCheck, isLoading: isEnrollmentCheckLoading } = useEnrollmentCheck(
    courseData?.slug,
    isAuthenticated && !previewToken,
  );
  const isEnrolled = isAuthenticated && !previewToken && enrollmentCheck?.enrolled === true;

  const allLessons = courseData?.sections?.flatMap((s: any) => s.lessons || []) || [];
  const currentLessonObj = allLessons.find((l: any) => l.slug === targetLessonSlug);
  const purchaseLocked =
    !previewToken &&
    !isEnrollmentCheckLoading &&
    !isEnrolled &&
    (currentLessonObj?.isPreview !== true || currentLessonObj?.type === 'quiz');

  const regularLessonQuery = useLessonBySlug(targetLessonSlug, courseSlug);
  const previewLessonQuery = usePreviewLesson(
    previewToken ?? undefined,
    currentLessonObj?.id,
    targetLessonSlug,
  );

  const {
    data: lesson,
    isLoading: isLessonLoading,
    isError: isLessonError,
  } = previewToken ? previewLessonQuery : regularLessonQuery;

  const lessonData = lesson;

  const { data: courseProgress } = useCourseProgress(
    courseData?.id,
    isEnrolled,
  );

  const { data: lessonQuizzes } = useLessonQuizzes(
    lessonData?.id,
    isEnrolled && !previewToken,
  );
  const lessonQuizzesByLesson = useCourseLessonQuizzes(
    allLessons.map((lesson: any) => Number(lesson.id)),
    isEnrolled && !previewToken,
  );

  // Sang bài khác → đóng giao diện quiz toàn màn hình.
  useEffect(() => {
    setQuizOpen(false);
  }, [lessonData?.id]);

  useEffect(() => {
    if (requestedQuizId && isEnrolled && !previewToken) {
      setQuizOpen(true);
    }
  }, [requestedQuizId, isEnrolled, previewToken]);

  const lessonProgressMap = new Map<number, { isCompleted: boolean; progressPercent: number; watchSeconds: number }>();
  courseProgress?.lessons?.forEach((lp) => {
    lessonProgressMap.set(Number(lp.lessonId), {
      isCompleted: lp.isCompleted,
      progressPercent: lp.progressPercent,
      watchSeconds: lp.watchSeconds,
    });
  });

  const currentLessonProgress = lessonData
    ? lessonProgressMap.get(lessonData.id)
    : undefined;

  // Khóa tuần tự: bài sau mở khi bài đứng trước đã xem >= 90% (đồng bộ backend).
  const lockOptions = { isEnrolled, isPreviewMode: !!previewToken };
  const lockedLessonIds = buildSequentialLocks(
    courseData?.sections ?? [],
    lessonProgressMap,
    lockOptions,
  );

  const { handleProgressUpdate, handleVideoEnd } = useVideoProgress({
    courseId: courseData?.id ?? 0,
    lessonId: lessonData?.id ?? 0,
    enabled: isEnrolled && !!lessonData && !lessonData.isLocked,
  });

  // Ref player → panel Ghi chú tua video về mốc của note và đọc thời điểm hiện tại.
  const videoRef = useRef<VideoPlayerHandle>(null);

  const navigate = useNavigate();
  const currentIndex = allLessons.findIndex((l: any) => l.slug === lessonData?.slug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Phần (module) chứa bài học hiện tại — dùng cho breadcrumb
  const currentSection = courseData?.sections?.find((s: any) =>
    (s.lessons || []).some((l: any) => l.slug === targetLessonSlug)
  );

  const totalLessons = allLessons.length;
  const completedLessons = courseProgress?.completedLessons ?? 0;
  // Cùng công thức BE (giây đã xem / tổng giây) — tính từ cache để chip % chạy theo
  // heartbeat 15s mà không cần refetch mạng.
  const totalCourseSeconds = allLessons.reduce((sum: number, l: any) => sum + (l.duration || 0), 0);
  // Cache cũ còn dòng trùng (lessonId string/number) → dedupe lấy max như BE Math.max.
  const watchedByLesson = new Map<number, number>();
  (courseProgress?.lessons ?? []).forEach((lp) => {
    const id = Number(lp.lessonId);
    watchedByLesson.set(id, Math.max(watchedByLesson.get(id) ?? 0, lp.watchSeconds || 0));
  });
  const totalWatchedSeconds = [...watchedByLesson.values()].reduce((sum, s) => sum + s, 0);
  const progressPercent =
    totalCourseSeconds > 0
      ? Math.min(Math.round((totalWatchedSeconds / totalCourseSeconds) * 100), 100)
      : (courseProgress?.totalProgress ?? 0);
  const remainingMinutes = Math.round(
    allLessons
      .filter((l: any) => !lessonProgressMap.get(Number(l.id))?.isCompleted)
      .reduce((sum: number, l: any) => sum + (l.duration || 0), 0) / 60
  );

  const navigateToLesson = (slug: string) => {
    const url = `/learning/${courseSlug}/${slug}${previewToken ? `?previewToken=${previewToken}` : ''}`;
    navigate(url);
  };

  // Điều hướng có kiểm khóa: bấm vào bài bị khóa → hiện lý do thay vì vào bài.
  const handleGoToLesson = (lesson: { slug: string; id: number; isPreview: boolean } | null) => {
    if (!lesson) return;
    const lockMessage = getLessonLockMessage(lesson, lockedLessonIds, lockOptions);
    if (lockMessage) {
      toast.warning(lockMessage);
      return;
    }
    navigateToLesson(lesson.slug);
  };

  if (courseData && !lessonSlug && defaultLessonSlug) {
    return <Navigate to={`/learning/${courseSlug}/${defaultLessonSlug}${previewToken ? `?previewToken=${previewToken}` : ''}`} replace />;
  }

  if (isCourseLoading || isLessonLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-piemind-pink" />
      </div>
    );
  }

  if (isCourseError || isLessonError || !courseData || !lessonData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Đã có lỗi xảy ra</h2>
          <p className="text-slate-500">Không thể tải dữ liệu bài học.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <LearningHeader
        courseId={courseData.id}
        courseTitle={courseData.title}
        courseSlug={courseData.slug}
        progress={progressPercent}
        sectionTitle={currentSection?.title}
        completedLessons={isEnrolled ? completedLessons : undefined}
        totalLessons={isEnrolled ? totalLessons : undefined}
        remainingMinutes={isEnrolled ? remainingMinutes : undefined}
        previewMode={!!previewToken}
        isEnrolled={isEnrolled}
        previewToken={previewToken ?? undefined}
        editUrl={
          previewToken
            ? `${INSTRUCTOR_URL}/courses/${courseData.id}/edit`
            : undefined
        }
      />

      <div className="flex flex-1 flex-col lg:flex-row h-[calc(100vh-64px)]">
        <div className="flex-1 overflow-y-auto min-w-0 custom-scrollbar flex flex-col bg-slate-50">
          {/* Bài đang khóa → màn hình khóa (không tải player/quiz) */}
          {lessonData.isLocked || purchaseLocked ? (
            <div className="w-full p-4 md:p-6">
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 text-center shadow-[0_4px_20px_rgba(15,23,42,0.06)] md:rounded-3xl">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Lock className="h-6 w-6 text-slate-400" />
                </span>
                <p className="text-lg font-extrabold text-slate-900">Bài học đang khóa</p>
                <p className="max-w-md text-sm font-medium text-slate-500">
                  {purchaseLocked ? LOCK_MESSAGES.notEnrolled : LOCK_MESSAGES.previousIncomplete}
                </p>
                {purchaseLocked ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/checkout/${courseData.slug}`)}
                    className="mt-1 rounded-xl bg-piemind-pink px-4 py-2 text-sm font-bold text-white shadow-[0_4px_14px_rgba(243,129,129,0.28)] transition hover:bg-piemind-pink/90"
                  >
                    Mở khóa khóa học
                  </button>
                ) : prevLesson ? (
                  <button
                    onClick={() => navigateToLesson(prevLesson.slug)}
                    className="mt-1 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                  >
                    Quay lại bài trước
                  </button>
                ) : null}
              </div>
            </div>
          ) : lessonData.type === 'quiz' ? (
            previewToken ? (
              <div className="m-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm font-medium text-amber-700 md:m-6">
                Bài kiểm tra không khả dụng trong chế độ xem trước.
              </div>
            ) : (
              <QuizLauncher
                variant="hero"
                quizzes={lessonQuizzes}
                isLoading={lessonQuizzes === undefined}
                onStart={() => setQuizOpen(true)}
              />
            )
          ) : (
            <VideoPlayer
              ref={videoRef}
              videoSource={lessonData.videoSource}
              posterUrl={lessonData.thumbnail}
              title={lessonData.title}
              initialPosition={currentLessonProgress?.isCompleted ? 0 : currentLessonProgress?.watchSeconds}
              watchedSeconds={currentLessonProgress?.watchSeconds}
              onProgressUpdate={handleProgressUpdate}
              onVideoEnd={handleVideoEnd}
            />
          )}

          {/* Tiêu đề bài học DƯỚI video */}
          <div className="px-4 pt-1 pb-4 md:px-6">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-piemind-pink">
                  {currentSection
                    ? formatSectionLabel(
                        courseData.sections.findIndex((s: any) => s.id === currentSection.id),
                        currentSection.title,
                      )
                    : 'Bài học'}
                </p>
                <h1 className="mt-1 truncate text-xl font-extrabold text-slate-900 md:text-2xl">
                  {lessonData.title}
                </h1>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                {currentLessonProgress?.isCompleted && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Đã hoàn thành
                  </span>
                )}
                {!isEnrolled && !previewToken && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                    Xem thử
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card thông tin + điều hướng */}
          <div className="px-4 md:px-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.06)] md:flex-row md:items-center md:justify-between md:p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="rounded-full bg-piemind-pink px-2.5 py-1 text-[11px] font-extrabold text-white">
                  Bước {currentIndex >= 0 ? currentIndex + 1 : 1}/{totalLessons}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                  {lessonData.type === 'quiz' ? 'Bài kiểm tra' : lessonData.type === 'video' ? 'Video' : 'Bài đọc'}
                </span>
                {lessonData.duration ? (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 tabular-nums">
                    {Math.floor(lessonData.duration / 60)} phút
                  </span>
                ) : null}
                {currentLessonProgress && !currentLessonProgress.isCompleted && currentLessonProgress.progressPercent > 0 && (
                  <span className="rounded-full border border-piemind-pink/30 bg-piemind-pink/10 px-2.5 py-1 text-piemind-pink">
                    Đã xem {Math.round(currentLessonProgress.progressPercent)}%
                  </span>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  disabled={!prevLesson}
                  onClick={() => prevLesson && navigateToLesson(prevLesson.slug)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 md:flex-none"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  Bài trước
                </button>
                <button
                  disabled={!nextLesson}
                  onClick={() => handleGoToLesson(nextLesson)}
                  className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-piemind-pink px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-piemind-pink/90 hover:shadow-lg hover:shadow-piemind-pink/25 disabled:cursor-not-allowed disabled:opacity-40 md:flex-none"
                >
                  Bài tiếp theo
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {!previewToken && lessonData.type !== 'quiz' && (lessonQuizzes?.length ?? 0) > 0 && (
            <QuizLauncher
              variant="banner"
              quizzes={lessonQuizzes}
              onStart={() => setQuizOpen(true)}
            />
          )}

          <div className="px-4 py-4 md:px-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
              <LearningTabs
                lesson={lessonData}
                previewToken={previewToken ?? undefined}
              isEnrolled={isEnrolled}
              courseSlug={courseData.slug}
                videoRef={videoRef}
              />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 h-[50vh] lg:h-full">
          <LearningSidebar
            sections={courseData.sections}
            courseSlug={courseData.slug}
            isEnrolled={isEnrolled}
            lessonProgressMap={lessonProgressMap}
            lessonQuizzesByLesson={lessonQuizzesByLesson}
            lockedLessonIds={lockedLessonIds}
            onLessonClickLocked={(message) => toast.warning(message)}
          />
        </div>
      </div>

      {/* Quiz ở GIAO DIỆN RIÊNG toàn màn hình */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
          {/* Header riêng của quiz */}
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 md:h-16 md:px-6">
            <button
              type="button"
              onClick={() => setQuizOpen(false)}
              aria-label="Quay lại bài học"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all hover:border-piemind-pink hover:text-piemind-pink md:h-10 md:w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-piemind-pink/10 text-piemind-pink sm:flex">
                <ClipboardList className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-slate-900 md:text-base">
                  {lessonData.title}
                </p>
                <p className="text-[11px] font-semibold text-slate-400">Bài kiểm tra</p>
              </div>
            </div>
            <span className="ml-auto hidden shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500 sm:block">
              Làm bài toàn màn hình
            </span>
          </header>

          {/* Nội dung quiz — cuộn riêng */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <QuizLesson
              lessonId={lessonData.id}
              initialQuizId={requestedQuizId}
              courseId={courseData.id}
              className="mx-auto max-w-4xl md:max-w-5xl"
              onNextLesson={
                nextLesson
                  ? () => {
                      setQuizOpen(false);
                      handleGoToLesson(nextLesson);
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
