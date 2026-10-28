import { api } from "@fe/lib/axios";
import type { Quiz } from "../types/quiz.types";

export const quizService = {
  createQuiz: async (payload: Quiz) => {
    const response = await api.post('/instructor/quizzes', payload);
    return response.data;
  },
  
  updateQuiz: async (id: number, payload: Quiz) => {
    const response = await api.put(`/instructor/quizzes/${id}`, payload);
    return response.data;
  },

  getQuizById: async (id: number) => {
    const response = await api.get(`/instructor/quizzes/${id}`);
    return response.data;
  },

  deleteQuiz: async (id: number) => {
    const response = await api.delete(`/instructor/quizzes/${id}`);
    return response.data;
  },

  attachToLesson: async (quizId: number, lessonId: number | string) => {
    const response = await api.post(`/instructor/quizzes/${quizId}/attach`, { lessonId: lessonId.toString() });
    return response.data;
  },

  getLessonQuizzes: async (lessonId: number) => {
    const response = await api.get(`/instructor/quizzes/lesson/${lessonId}`);
    return response.data;
  },

  detachFromLesson: async (quizId: number, lessonId: number) => {
    const response = await api.delete(`/instructor/quizzes/${quizId}/detach/${lessonId}`);
    return response.data;
  }
};
