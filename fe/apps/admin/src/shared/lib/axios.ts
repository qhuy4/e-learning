import { createApi } from "@fe/lib/axios.v.ts";
import { store } from "@/shared/stores/store.ts";
import { logout } from "@/features/auth/store/authSlice";

export const adminApi = createApi(
    () => store.getState().auth.token,
    '/admin',
);

adminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && store.getState().auth.token) {
            store.dispatch(logout());
        }
        return Promise.reject(error);
    },
);
