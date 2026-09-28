import { api } from '@fe/lib/axios';
import type { Dictation } from '../types/dictation.types';

async function postFormData(url: string, formData: FormData) {
  const response = await api.post(url, formData, {
    headers: { "Content-Type": undefined },
  });
  return response.data;
}

async function putFormData(url: string, formData: FormData) {
  const response = await api.put(url, formData, {
    headers: { "Content-Type": undefined },
  });
  return response.data;
}

export const dictationService = {
  createDictation: async (payload: Dictation, audioFile?: File) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify({
      title: payload.title,
      description: payload.description,
      level: payload.level,
      playLimit: payload.playLimit,
      sentences: payload.sentences,
    }));
    if (audioFile) {
      formData.append("audio", audioFile);
    }
    return postFormData('/teacher/dictations', formData);
  },

  updateDictation: async (id: number, payload: Partial<Dictation>, audioFile?: File) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify({
      title: payload.title,
      description: payload.description,
      audioUrl: payload.audioUrl,
      level: payload.level,
      playLimit: payload.playLimit,
      sentences: payload.sentences,
    }));
    if (audioFile) {
      formData.append("audio", audioFile);
    }
    return putFormData(`/teacher/dictations/${id}`, formData);
  },

  getDictationById: async (id: number) => {
    const response = await api.get(`/teacher/dictations/${id}`);
    return response.data;
  },

  getLessonDictations: async (lessonId: number) => {
    const response = await api.get(`/teacher/dictations/lesson/${lessonId}`);
    return response.data;
  },

  attachToLesson: async (dictationId: number, lessonId: number | string) => {
    const response = await api.post(`/teacher/dictations/${dictationId}/attach`, { lessonId: lessonId.toString() });
    return response.data;
  },

  detachFromLesson: async (dictationId: number, lessonId: number | string) => {
    const response = await api.delete(`/teacher/dictations/${dictationId}/detach/${lessonId}`);
    return response.data;
  },

  deleteDictation: async (id: number) => {
    const response = await api.delete(`/teacher/dictations/${id}`);
    return response.data;
  }
};
