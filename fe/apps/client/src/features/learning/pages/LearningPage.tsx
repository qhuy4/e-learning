import { useParams, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LearningHeader,
  VideoPlayer,
  LearningTabs,
  LearningSidebar,
} from '../components/LearningPlayer';
import { useLearningCourse, useLessonBySlug, usePreviewLesson, useCourseProgress } from '../hooks/use-learning';
import { usePreviewCourse } from '../../courses/hooks/use-courses';
import { useEnrollmentCheck } from '../../enrollment/hooks/use-enrollment';
import { useAuth } from '../../auth/hooks/use-auth';
import { useVideoProgress } from '../hooks/use-video-progress';
import { Loader2 } from 'lucide-react';

export const LearningPage = () => {
  const { courseSlug, lessonSlug } = useParams<{ courseSlug: string; lessonSlug?: string }>();
  const [searchParams] = useSearchParams();
  const previewToken = searchParams.get('previewToken');

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
  const { data: enrollmentCheck } = useEnrollmentCheck(
    courseData?.slug,
    isAuthenticated && !previewToken,
  );
  const isEnrolled = isAuthenticated && !previewToken && enrollmentCheck?.enrolled === true;

  const allLessons = courseData?.sections?.flatMap((s: any) => s.lessons || []) || [];
  const currentLessonObj = allLessons.find((l: any) => l.slug === targetLessonSlug);

  const regularLessonQuery = useLessonBySlug(targetLessonSlug);
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

  const { handleProgressUpdate, handleVideoEnd } = useVideoProgress({
    courseId: courseData?.id ?? 0,
    lessonId: lessonData?.id ?? 0,
    enabled: isEnrolled && !!lessonData,
  });

  const navigate = useNavigate();
  const currentIndex = allLessons.findIndex((l: any) => l.slug === lessonData?.slug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const navigateToLesson = (slug: string) => {
    const url = `/learning/${courseSlug}/${slug}${previewToken ? `?previewToken=${previewToken}` : ''}`;
    navigate(url);
  };

  if (courseData && !lessonSlug && defaultLessonSlug) {
    return <Navigate to={`/learning/${courseSlug}/${defaultLessonSlug}${previewToken ? `?previewToken=${previewToken}` : ''}`} replace />;
  }

  if (isCourseLoading || isLessonLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
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
        courseTitle={courseData.title}
        courseSlug={courseData.slug}
        progress={courseProgress?.totalProgress ?? 0}
      />

      <div className="flex flex-1 flex-col lg:flex-row h-[calc(100vh-64px)]">
        <div className="flex-1 overflow-y-auto min-w-0 custom-scrollbar flex flex-col bg-slate-50">
          <VideoPlayer
            videoSource={lessonData.videoSource}
            title={lessonData.title}
            initialPosition={currentLessonProgress?.isCompleted ? 0 : currentLessonProgress?.watchSeconds}
            onProgressUpdate={handleProgressUpdate}
            onVideoEnd={handleVideoEnd}
          />
          
          <div className="bg-white p-4 md:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">{lessonData.title}</h1>
              {currentLessonProgress?.isCompleted && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Đã hoàn thành
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                disabled={!prevLesson}
                onClick={() => prevLesson && navigateToLesson(prevLesson.slug)}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                Bài trước
              </button>
              <button
                disabled={!nextLesson}
                onClick={() => nextLesson && navigateToLesson(nextLesson.slug)}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-500/25 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2 group"
              >
                Bài tiếp theo
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="px-4 py-2 md:px-6 md:py-4">
            <LearningTabs lesson={lessonData} />
          </div>
        </div>

        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 h-[50vh] lg:h-full">
          <LearningSidebar
            sections={courseData.sections}
            courseSlug={courseData.slug}
            isEnrolled={isEnrolled}
            lessonProgressMap={lessonProgressMap}
          />
        </div>
      </div>
    </div>
  );
};
