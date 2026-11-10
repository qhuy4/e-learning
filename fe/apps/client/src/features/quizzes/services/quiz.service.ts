import { api } from '@/shared/lib/axios';
import type { LessonQuiz, QuizAttemptHistoryItem, QuizAttemptResult, QuizAttemptReview, SubmitQuizAnswer } from '../types/quiz.type';

export const quizService = {
  /** Danh sách quiz của 1 lesson (kèm câu hỏi — không có đáp án đúng). */
  getLessonQuizzes: async (lessonId: number): Promise<LessonQuiz[]> => {
    const { data: res } = await api.get(`/student/quizzes/lesson/${lessonId}`);
    return res.data ?? [];
  },

  /** Bắt đầu làm bài → tạo attempt. */
  startQuiz: async (quizId: number): Promise<QuizAttemptResult> => {
    const { data: res } = await api.post(`/student/quizzes/${quizId}/start`);
    return res.data;
  },

  /** Nộp bài → BE chấm điểm, trả về attempt đã cập nhật. */
  submitQuiz: async (
    attemptId: string,
    answers: SubmitQuizAnswer[],
  ): Promise<QuizAttemptResult> => {
    const { data: res } = await api.post(`/student/quizzes/attempts/${attemptId}/submit`, {
      answers,
    });
    return res.data;
  },

  getAttemptHistory: async (quizId: number): Promise<QuizAttemptHistoryItem[]> => {
    const { data: res } = await api.get(`/student/quizzes/${quizId}/history`);
    return res.data ?? [];
  },

  getAttemptReview: async (attemptId: string | number): Promise<QuizAttemptReview> => {
    const { data: res } = await api.get(`/student/quizzes/attempts/${attemptId}/review`);
    return res.data;
  },
};

/** Lấy thông báo lỗi tiếng Việt từ BE (GlobalExceptionFilter). */
export const getErrorMessage = (e: unknown, fallback: string): string => {
  const err = e as any;
  return (
    err?.response?.data?.error?.message ??
    err?.response?.data?.message ??
    err?.message ??
    fallback
  );
};

/** HTTP status của lỗi (để phân biệt 403 quyền truy cập...). */
export const getErrorStatus = (e: unknown): number | undefined => {
  const err = e as any;
  return err?.response?.status;
};
