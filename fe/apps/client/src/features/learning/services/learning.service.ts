import { api } from '@fe/lib/axios';
import type { LessonDetail, LearningCourse } from '../types/learning.type';

export const learningService = {
  getLessonBySlug: async (lessonSlug: string): Promise<LessonDetail> => {
    const response = await api.get<LessonDetail>(`/lessons/slug/${lessonSlug}`);
    return response.data;
  },

  previewLesson: async (
    token: string,
    lessonId?: number,
    lessonSlug?: string,
  ): Promise<LessonDetail> => {
    const response = await api.get<LessonDetail>(`/lessons/preview`, {
      params: { token, lessonId, lessonSlug },
    });
    return response.data;
  },

  getCourseBySlug: async (courseSlug: string): Promise<LearningCourse> => {
    const response = await api.get<LearningCourse>(`/courses/${courseSlug}`);
    return response.data;
  },
};
