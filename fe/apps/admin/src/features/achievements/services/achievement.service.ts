import type {
  Achievement,
  PaginatedAchievementResponse,
  PaginatedAchievementUserResponse,
} from "../types/achievement";
import { adminApi } from "@/shared/lib/axios.ts";

export const achievementService = {
  list: async (params: {
    page: number;
    limit: number;
    keyword?: string;
    criteria?: string;
    isActive?: boolean;
  }): Promise<PaginatedAchievementResponse> => {
    const response = await adminApi.get<PaginatedAchievementResponse>("/achievements", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Achievement> => {
    const response = await adminApi.get(`/achievements/${id}`);
    return response.data.data;
  },

  create: async (data: {
    name: string;
    description: string;
    icon?: string;
    criteria: string;
    threshold: number;
    reward?: unknown;
    isActive?: boolean;
  }): Promise<Achievement> => {
    const response = await adminApi.post("/achievements", data);
    return response.data.data;
  },

  update: async (
    id: number,
    data: {
      name?: string;
      description?: string;
      icon?: string;
      criteria?: string;
      threshold?: number;
      reward?: unknown;
      isActive?: boolean;
    },
  ): Promise<Achievement> => {
    const response = await adminApi.patch(`/achievements/${id}`, data);
    return response.data.data;
  },

  updateWithIcon: async (
    id: number,
    data: {
      name: string;
      description: string;
      icon: string | File;
      criteria: string;
      threshold: number;
      isActive: boolean;
    },
  ): Promise<Achievement> => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("criteria", data.criteria);
    formData.append("threshold", String(data.threshold));
    formData.append("isActive", String(data.isActive));
    if (data.icon instanceof File) {
      formData.append("icon", data.icon);
    } else if (data.icon) {
      formData.append("icon", data.icon);
    }
    const response = await adminApi.patch(`/achievements/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  remove: async (id: number): Promise<void> => {
    await adminApi.delete(`/achievements/${id}`);
  },

  getUsersByAchievement: async (
    id: number,
    params: { page: number; limit: number; keyword?: string },
  ): Promise<PaginatedAchievementUserResponse> => {
    const response = await adminApi.get<PaginatedAchievementUserResponse>(`/achievements/${id}/users`, { params });
    return response.data;
  },
};
