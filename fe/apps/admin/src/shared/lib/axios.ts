import {createApi} from "@fe/lib/axios.v.ts";
import {store} from "@/shared/stores/store.ts";
import {logout, setToken} from "@/features/auth/store/authSlice.ts";

export const adminApi = createApi(
    () => store.getState().auth.token,
    (token) => store.dispatch(setToken(token)),
    () => store.dispatch(logout()),
    "/admin",
    "/admin/auth/refresh",
);