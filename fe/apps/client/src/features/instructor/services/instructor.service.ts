import { api } from "@/shared/lib/axios";

export const instructorService = {
  /** Gửi email mời đăng ký giảng viên */
  sendInvite: async (email: string, fullName?: string) => {
    const response = await api.post("/instructor-applications/invite", {
      email,
      fullName,
    });
    return response.data?.data ?? response.data;
  },

  /** Đăng nhập */
  login: async (payload: { email: string; password: string }) => {
    const response = await api.post("/instructor/auth/login", payload);
    return response.data?.data ?? response.data;
  },
};
