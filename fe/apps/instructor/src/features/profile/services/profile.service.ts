import { instructorApi } from "@/shared/lib/axios";
import type { Profile } from "../types/profile.types";

export const profileService = {
  async getProfile(): Promise<{ data: Profile }> {
    const response = await instructorApi.get("/profile");
    return response.data;
  },

  async updateProfile(data: {
    name?: string;
    profile?: Record<string, any>;
    avatar?: File;
  }): Promise<{ data: Profile }> {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.profile) formData.append("profile", JSON.stringify(data.profile));
    if (data.avatar) formData.append("avatar", data.avatar);
    const response = await instructorApi.patch("/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
