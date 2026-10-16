import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningService } from '../services/learning.service';
import type { CourseProgress } from '../types/learning.type';

// Cache 5 phút — tránh refetch (ký lại presigned URL video) mỗi lần refocus.
const STALE_TIME = 5 * 60 * 1000;

export const useLessonBySlug = (
  lessonSlug: string | undefined,
  courseSlug?: string,
) => {
  return useQuery({
    // Thêm courseSlug vào key tránh cache nhầm khi trùng slug giữa các version
    queryKey: ['lesson', courseSlug, lessonSlug],
    queryFn: () => learningService.getLessonBySlug(lessonSlug!, courseSlug),
    enabled: !!lessonSlug,
    staleTime: STALE_TIME,
  });
};

export const usePreviewLesson = (
  token: string | undefined,
  lessonId?: number,
  lessonSlug?: string,
) => {
  return useQuery({
    queryKey: ['lesson', 'preview', token, lessonId, lessonSlug],
    queryFn: () => learningService.previewLesson(token!, lessonId, lessonSlug),
    enabled: !!token && (!!lessonId || !!lessonSlug),
    staleTime: STALE_TIME,
  });
};

export const useLearningCourse = (courseSlug: string | undefined) => {
  return useQuery({
    queryKey: ['learning-course', courseSlug],
    queryFn: () => learningService.getCourseBySlug(courseSlug!),
    enabled: !!courseSlug,
    staleTime: STALE_TIME,
  });
};

export const useUpdateLessonProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: learningService.updateLessonProgress,
    onSuccess: (updated, variables) => {
      if (!updated) return;
      queryClient.setQueryData(['lesson-progress', variables.lessonId], updated);

      // Ghi thẳng response 15s vào cache course-progress → chip/sidebar cập nhật
      // ngay, không cần refetch API.
      const cacheKey = ['course-progress', variables.courseId];
      // bigint trong JSON trả string → Number() để không append trùng dòng mỗi heartbeat.
      const targetId = Number(variables.lessonId);
      const prevCompleted =
        queryClient
          .getQueryData<CourseProgress>(cacheKey)
          ?.lessons?.find((l) => Number(l.lessonId) === targetId)?.isCompleted ?? false;

      queryClient.setQueryData<CourseProgress>(cacheKey, (old) => {
        if (!old) return old;
        const exists = old.lessons.some((l) => Number(l.lessonId) === targetId);
        const lessons = exists
          ? old.lessons.map((l) => (Number(l.lessonId) === targetId ? updated : l))
          : [...old.lessons, updated];
        return { ...old, lessons, completedLessons: lessons.filter((l) => l.isCompleted).length };
      });

      // Chỉ gọi server khi đổi trạng thái hoàn thành (totalProgress + My Courses).
      if (updated.isCompleted && !prevCompleted) {
        queryClient.invalidateQueries({ queryKey: cacheKey });
        queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      }
    },
  });
};

export const useLessonProgress = (lessonId: number | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['lesson-progress', lessonId],
    queryFn: () => learningService.getLessonProgress(lessonId!),
    enabled: enabled && !!lessonId,
  });
};

export const useCourseProgress = (courseId: number | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => learningService.getCourseProgress(courseId!),
    enabled: enabled && !!courseId,
  });
};

export const useLessonMaterials = (lessonId: number | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['lesson-materials', lessonId],
    queryFn: () => learningService.getLessonMaterials(lessonId!),
    enabled: enabled && !!lessonId,
  });
};
