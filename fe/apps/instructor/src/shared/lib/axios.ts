import { createApi } from "@fe/lib/axios.v.ts";
import { store } from "@/shared/stores/store.ts";
import { logout as logoutAction, setToken } from "@/features/auth/store/authSlice.ts";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export const logout = () => {
    fetch(`${BASE}/instructor/auth/logout`, {
        method: "POST",
        credentials: "include",
    }).catch(() => {});
    store.dispatch(logoutAction());
};

export const instructorApi = createApi(
    () => store.getState().auth.token,
    (token) => store.dispatch(setToken(token)),
    logout,
    "/instructor",
    "/instructor/auth/refresh",
);

export const instructorRootApi = createApi(
    () => store.getState().auth.token,
    (token) => store.dispatch(setToken(token)),
    logout,
    "",
    "/instructor/auth/refresh",
);
