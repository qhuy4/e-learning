import { instructorApi } from "@/shared/lib/axios";

export const achievementService = {
  async getMyAchievements() {
    const response = await instructorApi.get("/achievements");
    return response.data;
  },
};
