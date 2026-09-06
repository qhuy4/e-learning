import { useQuery } from '@tanstack/react-query';
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
