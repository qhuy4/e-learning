import { instructorApi } from "@/shared/lib/axios";
import type {
  TeachingProfile,
  UpdateTeachingProfileRequest,
} from "../types/teaching-profile.types";

export const teachingProfileService = {
  async get(): Promise<TeachingProfile> {
    const res = await instructorApi.get("/teaching-profile");
    return res.data.data;
  },

  async update(data: UpdateTeachingProfileRequest): Promise<TeachingProfile> {
    const res = await instructorApi.put("/teaching-profile", data);
    return res.data.data;
  },
};
