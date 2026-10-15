import { api } from "@fe/lib/axios";

async function postFormData(url: string, formData: FormData) {
  const response = await api.post(url, formData, {
    headers: { "Content-Type": undefined },
  });
  return response.data;
}

async function patchFormData(url: string, formData: FormData) {
  const response = await api.patch(url, formData, {
    headers: { "Content-Type": undefined },
  });
  return response.data;
}

export const lessonService = {
  createLesson: async (sectionId: number, payload: any) => {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("type", payload.type || "video");
    if (payload.videoSource instanceof File) {
      formData.append("video", payload.videoSource);
    }
    if (payload.thumbnail instanceof File) {
      formData.append("thumbnail", payload.thumbnail);
    }
    if (payload.duration !== undefined && payload.duration !== "") {
      formData.append("duration", String(payload.duration));
    }
    if (payload.position !== undefined && payload.position !== "") formData.append("position", String(payload.position));
    if (payload.content) formData.append("content", payload.content);
    formData.append("isPreview", payload.isPreview === true || payload.isPreview === "true" ? "true" : "false");
    return postFormData(`/sections/${sectionId}/lessons`, formData);
  },

  getLessonById: async (id: number) => {
    const response = await api.get(`/sections/0/lessons/${id}`);
    return response.data;
  },

  updateLesson: async (id: number, payload: any) => {
    const formData = new FormData();
    if (payload.title) formData.append("title", payload.title);
    if (payload.type) formData.append("type", payload.type);
    if (payload.videoSource instanceof File) {
      formData.append("video", payload.videoSource);
    }
    if (payload.thumbnail instanceof File) {
      formData.append("thumbnail", payload.thumbnail);
    } else if (payload.thumbnail === undefined || payload.thumbnail === "") {
      // Ảnh bị xóa hoặc chưa từng có → sentinel '' báo backend xóa ảnh xem trước
      formData.append("thumbnail", "");
    }
    if (payload.duration !== undefined && payload.duration !== "") {
      formData.append("duration", String(payload.duration));
    }
    if (payload.position !== undefined) formData.append("position", String(payload.position));
    if (payload.content !== undefined) formData.append("content", payload.content);
    if (payload.isPreview !== undefined) {
      formData.append("isPreview", payload.isPreview === true || payload.isPreview === "true" ? "true" : "false");
    }
    return patchFormData(`/sections/0/lessons/${id}`, formData);
  },

  deleteLesson: async (id: number) => {
    const response = await api.delete(`/sections/0/lessons/${id}`);
    return response.data;
  },

  // ─── Tài liệu đính kèm bài học (lesson_materials / R2) ────────────────────
  getMaterials: async (lessonId: number) => {
    const response = await api.get(`/instructor/lessons/${lessonId}/materials`);
    return response.data;
  },

  uploadMaterial: async (lessonId: number, file: File, title?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);
    return postFormData(`/instructor/lessons/${lessonId}/materials`, formData);
  },

  updateMaterial: async (id: number, payload: { title?: string; description?: string }) => {
    const response = await api.patch(`/instructor/lessons/materials/${id}`, payload);
    return response.data;
  },

  deleteMaterial: async (id: number) => {
    const response = await api.delete(`/instructor/lessons/materials/${id}`);
    return response.data;
  },
};
