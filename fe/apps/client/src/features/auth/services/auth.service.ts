import { api } from "@fe/lib/axios";
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
};
