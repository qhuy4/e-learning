import { api } from '@fe/lib/axios';
import type { LessonDetail, LearningCourse, LessonProgress, CourseProgress } from '../types/learning.type';

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

  updateLessonProgress: async (payload: {
    courseId: number;
    lessonId: number;
    watchSeconds: number;
    progressPercent: number;
  }): Promise<LessonProgress> => {
    const { data: res } = await api.patch('/lesson-progress', payload);
    return res.data;
  },

  getLessonProgress: async (lessonId: number): Promise<LessonProgress | null> => {
    const { data: res } = await api.get(`/lesson-progress/${lessonId}`);
    return res.data;
  },

  getCourseProgress: async (courseId: number): Promise<CourseProgress> => {
    const { data: res } = await api.get(`/lesson-progress/course/${courseId}`);
    return res.data;
  },
};
