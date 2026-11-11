import { api } from "@/shared/lib/axios";
import type {
  ApiInstructor,
  AvailabilityWindow,
  AvailableTeachersResponse,
  GetAvailableInstructorsParams,
  GetInstructorsParams,
  InstructorListItem,
  SlotCheckResult,
} from "../types/instructor.type";

function normalizeInstructor(raw: ApiInstructor): InstructorListItem {
  const profile = raw.profile ?? null;
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    avatarUrl: raw.avatarUrl ?? null,
    headline: profile?.headline ?? raw.headline ?? null,
    bio: profile?.bio ?? raw.bio ?? null,
    avgRating: Number(profile?.avgRating ?? raw.avgRating ?? 0),
    totalStudents: profile?.totalStudents ?? 0,
    hourlyRate: Number(profile?.hourlyRate ?? 0),
    certificateTags: profile?.certificateTags ?? [],
  };
}

export const instructorService = {
  getAvailableInstructors: async (
    params?: GetAvailableInstructorsParams,
  ): Promise<AvailableTeachersResponse> => {
    const { data: res } = await api.get("/availabilities", {
      params: { limit: 100, ...params },
    });
    return {
      data: Array.isArray(res?.data) ? res.data : [],
      meta: res?.meta ?? { page: 1, limit: 100, total: 0, totalPages: 0 },
    };
  },

  getInstructors: async (
    params?: GetInstructorsParams,
  ): Promise<{ data: InstructorListItem[]; meta: AvailableTeachersResponse["meta"] }> => {
    const { data: res } = await api.get("/instructors", {
      params: { page: 1, limit: 100, ...params },
    });
    const raw: ApiInstructor[] = Array.isArray(res?.data) ? res.data : [];
    return {
      data: raw.map(normalizeInstructor),
      meta: res?.meta ?? { page: 1, limit: 100, total: raw.length, totalPages: 1 },
    };
  },

  getInstructorDetail: async (id: number): Promise<InstructorListItem> => {
    const { data: res } = await api.get(`/instructors/${id}`);
    return normalizeInstructor((res?.data ?? res) as ApiInstructor);
  },

  /** Day window + busy blocks for booking UI. */
  getAvailabilityWindow: async (
    bookingDate: string,
    instructorId: number,
  ): Promise<AvailabilityWindow> => {
    try {
      const { data: res } = await api.get("/availabilities/window", {
        params: { instructorId, bookingDate },
      });
      const raw = res?.data ?? res;
      return {
        available: Boolean(raw?.available),
        start: raw?.start ?? null,
        end: raw?.end ?? null,
        busy: Array.isArray(raw?.busy) ? raw.busy : [],
      };
    } catch {
      return { available: false, start: null, end: null, busy: [] };
    }
  },

  /** Free/busy map for candidate starts (optional; window is enough for most UI). */
  checkSlots: async (
    bookingDate: string,
    instructorId: number,
    slots: string[],
    durationMinutes: number,
  ): Promise<SlotCheckResult> => {
    if (!slots.length) return {};

    try {
      const { data: res } = await api.get("/availabilities/slots", {
        params: {
          instructorId,
          bookingDate,
          slots: slots.join(","),
          durationMinutes,
        },
      });
      const raw = res?.data ?? res;
      const map: SlotCheckResult = {};
      for (const slot of slots) {
        map[slot] = Boolean(raw?.[slot]);
      }
      return map;
    } catch {
      return Object.fromEntries(slots.map((s) => [s, false]));
    }
  },
};
