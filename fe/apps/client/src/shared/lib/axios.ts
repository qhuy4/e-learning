import { createApi } from "@fe/lib/axios.v.ts";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const clearLocal = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth:logout"));
};

const remoteLogout = () => {
  fetch(`${BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
};

export const logout = () => {
  remoteLogout();
  clearLocal();
};

export const setToken = (token: string) => {
  localStorage.setItem("accessToken", token);
  window.dispatchEvent(new Event("auth:token-updated"));
};

export const api = createApi(
  () => localStorage.getItem("accessToken"),
  setToken,
  logout,
  "",
  "/auth/refresh",
);
