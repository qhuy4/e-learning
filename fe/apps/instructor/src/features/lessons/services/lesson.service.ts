import { api } from "@fe/lib/axios";

export const lessonService = {
  createLesson: async (sectionId: number, payload: any) => {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("type", payload.type || "video");
    if (payload.videoSource && payload.videoSource instanceof File) formData.append("video", payload.videoSource);
    if (payload.thumbnail && payload.thumbnail instanceof File) formData.append("thumbnail", payload.thumbnail);
    if (payload.duration !== undefined) formData.append("duration", String(payload.duration));
    if (payload.position !== undefined) formData.append("position", String(payload.position));
    if (payload.content) formData.append("content", payload.content);
    formData.append("isPreview", String(payload.isPreview ?? false));
    const response = await api.post(`/sections/${sectionId}/lessons`, formData);
    return response.data;
  },

  getLessonById: async (id: number) => {
    const response = await api.get(`/sections/0/lessons/${id}`);
    return response.data;
  },

  updateLesson: async (id: number, payload: any) => {
    const formData = new FormData();
    if (payload.title) formData.append("title", payload.title);
    if (payload.type) formData.append("type", payload.type);
    if (payload.videoSource && payload.videoSource instanceof File) formData.append("video", payload.videoSource);
    if (payload.thumbnail && payload.thumbnail instanceof File) formData.append("thumbnail", payload.thumbnail);
    if (payload.duration !== undefined) formData.append("duration", String(payload.duration));
    if (payload.position !== undefined) formData.append("position", String(payload.position));
    if (payload.content !== undefined) formData.append("content", payload.content);
    if (payload.isPreview !== undefined) formData.append("isPreview", String(payload.isPreview));
    const response = await api.patch(`/sections/0/lessons/${id}`, formData);
    return response.data;
  },

  deleteLesson: async (id: number) => {
    const response = await api.delete(`/sections/0/lessons/${id}`);
    return response.data;
  },
};
