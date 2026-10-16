import { api } from '@/shared/lib/axios';
import type { LessonDetail, LearningCourse, LessonProgress, CourseProgress, LessonMaterial } from '../types/learning.type';

export const learningService = {
  getLessonBySlug: async (
    lessonSlug: string,
    courseSlug?: string,
  ): Promise<LessonDetail> => {
    // courseSlug để không load nhầm bài của version/course trùng slug
    const { data: res } = await api.get(`/lessons/slug/${lessonSlug}`, {
      params: courseSlug ? { courseSlug } : undefined,
    });
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

  getLessonMaterials: async (lessonId: number): Promise<LessonMaterial[]> => {
    const { data: res } = await api.get(`/lessons/${lessonId}/materials`);
    return res.data;
  },
};
