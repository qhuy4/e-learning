import { api } from "@/shared/lib/axios";
import type { LoginPayload, LoginResponse } from "../types/auth.type";

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data: res } = await api.post("/auth/login", payload);
    return res.data;
  },

  getMe: async () => {
    const { data: res } = await api.get("/users/me");
    return res.data;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<void> => {
    await api.post("/auth/register", payload);
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.get("/auth/verify-email", { params: { token } });
  },

  resendVerification: async (email: string): Promise<void> => {
    await api.post("/auth/resend-verification", { email });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post("/auth/forgot-password", { email });
  },

  resetPassword: async (payload: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<void> => {
    await api.post("/auth/reset-password", payload);
  },
};
