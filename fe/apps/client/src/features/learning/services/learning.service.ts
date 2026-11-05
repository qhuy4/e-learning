import { api } from '@/shared/lib/axios';
import type {
  LessonDetail,
  LearningCourse,
  LessonProgress,
  CourseProgress,
  LessonMaterial,
  LessonNote,
  LessonComment,
} from '../types/learning.type';

// bigint trong DB (user_id, lesson_id) pg trả về string trong JSON → chuẩn hóa
// về number tại service để cache react-query không lệch key (97 vs "97").
const toLessonNote = (raw: LessonNote): LessonNote => ({
  ...raw,
  id: Number(raw.id),
  lessonId: Number(raw.lessonId),
});

const toLessonComment = (raw: LessonComment): LessonComment => ({
  ...raw,
  id: Number(raw.id),
  lessonId: Number(raw.lessonId),
  parentId: raw.parentId !== null ? Number(raw.parentId) : null,
  user: raw.user ? { ...raw.user, id: Number(raw.user.id) } : undefined,
});

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

  getLessonMaterials: async (
    lessonId: number,
    previewToken?: string,
  ): Promise<LessonMaterial[]> => {
    const { data: res } = await api.get(`/lessons/${lessonId}/materials`, {
      params: previewToken ? { token: previewToken } : undefined,
    });
    return res.data;
  },

  // ─── Ghi chú bài học ───────────────────────────────────────────────────
  getLessonNotes: async (lessonId: number): Promise<LessonNote[]> => {
    const { data: res } = await api.get(`/lesson-notes/lesson/${lessonId}`);
    return (res.data as LessonNote[]).map(toLessonNote);
  },

  createLessonNote: async (payload: {
    lessonId: number;
    noteTimeSeconds: number;
    content: string;
  }): Promise<LessonNote> => {
    const { data: res } = await api.post('/lesson-notes', payload);
    return toLessonNote(res.data);
  },

  updateLessonNote: async (id: number, content: string): Promise<LessonNote> => {
    const { data: res } = await api.patch(`/lesson-notes/${id}`, { content });
    return toLessonNote(res.data);
  },

  deleteLessonNote: async (id: number): Promise<void> => {
    await api.delete(`/lesson-notes/${id}`);
  },

  // ─── Bình luận hỏi đáp bài học ───────────────────────────────────────
  getLessonComments: async (lessonId: number): Promise<LessonComment[]> => {
    const { data: res } = await api.get(`/lesson-comments/lesson/${lessonId}`);
    return (res.data as LessonComment[]).map(toLessonComment);
  },

  createLessonComment: async (payload: {
    lessonId: number;
    content: string;
    parentId?: number | null;
  }): Promise<LessonComment> => {
    const { data: res } = await api.post('/lesson-comments', payload);
    return toLessonComment(res.data);
  },

  updateLessonComment: async (
    id: number,
    content: string,
  ): Promise<LessonComment> => {
    const { data: res } = await api.patch(`/lesson-comments/${id}`, {
      content,
    });
    return toLessonComment(res.data);
  },

  deleteLessonComment: async (id: number): Promise<void> => {
    await api.delete(`/lesson-comments/${id}`);
  },
};
