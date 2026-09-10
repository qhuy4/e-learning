import { api } from '@fe/lib/axios';
import type { LessonDetail, LearningCourse } from '../types/learning.type';

export const learningService = {
  getLessonBySlug: async (lessonSlug: string): Promise<LessonDetail> => {
    const { data: res } = await api.get(`/lessons/slug/${lessonSlug}`);
    return res.data;
  },

  previewLesson: async (
    token: string,
    lessonId?: number,
    lessonSlug?: string,
  ): Promise<LessonDetail> => {
    const { data: res } = await api.get(`/lessons/preview`, {
      params: { token, lessonId, lessonSlug },
    });
    return res.data;
  },

  getCourseBySlug: async (courseSlug: string): Promise<LearningCourse> => {
    const { data: res } = await api.get(`/courses/${courseSlug}`);
    return res.data;
  },
};
