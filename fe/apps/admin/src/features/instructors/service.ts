import type {PendingInstructorProfile} from "@/features/instructors/type/pending-instructor.ts";
import type {PaginationResponse} from "@/shared/types/pagination.ts";
import type {User} from "@/features/users/types/user.type.ts";
import {adminApi} from "@/shared/lib/axios.ts";
import type {Instructor} from "@/features/instructors/type/instructor.ts";



export const adminInstructorService = {
  getPendingProfiles: async (status?: number): Promise<PendingInstructorProfile[]> => {
    const url = `/teachers/pending-profiles?status=${status ?? "all"}`;
    const response = await adminApi.get(url);
    const res = response.data?.data ?? response.data;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  },

  reviewProfile: async (profileId: number, status: number, rejectReason?: string) => {
    const response = await adminApi.patch(`/teachers/${profileId}/review`, {
      status,
      rejectReason,
    });
    return response.data?.data ?? response.data;
  },

  async getInstructors(page: number,
      limit: number,
      search?: string,
      sortBy?: string,
      sortOrder?: string,
  ): Promise<PaginationResponse<User>> {
    const response = await adminApi.get<PaginationResponse<User>>("/instructors/", {
      params: {
        page,
        limit,
        ...(search && {search}),
        ...(sortBy && {sortBy}),
        ...(sortOrder && {sortOrder}),
      }
    });
    return response.data;
  },

  async getInstructor(id: number): Promise<Instructor> {
    const response = await adminApi.get<{data: Instructor}>(`/instructors/${id}`);
    return response.data.data;
  },

  async updateInstructor(id: number, data: {
    name?: string;
    email?: string;
    status?: string;
    headline?: string;
    bio?: string;
    websiteUrl?: string;
    socialLinks?: Record<string, string> | null;
  }): Promise<Instructor> {
    const response = await adminApi.patch<{data: Instructor}>(`/instructors/${id}`, data);
    return response.data.data;
  },
};

