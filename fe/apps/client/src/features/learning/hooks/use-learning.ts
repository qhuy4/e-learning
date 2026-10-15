import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningService } from '../services/learning.service';

export const useLessonBySlug = (lessonSlug: string | undefined) => {
  return useQuery({
    queryKey: ['lesson', lessonSlug],
    queryFn: () => learningService.getLessonBySlug(lessonSlug!),
    enabled: !!lessonSlug,
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
  });
};

export const useLearningCourse = (courseSlug: string | undefined) => {
  return useQuery({
    queryKey: ['learning-course', courseSlug],
    queryFn: () => learningService.getCourseBySlug(courseSlug!),
    enabled: !!courseSlug,
  });
};

export const useUpdateLessonProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: learningService.updateLessonProgress,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ['course-progress', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
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
