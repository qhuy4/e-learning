import { createApi } from "@fe/lib/axios.v.ts";
import { store } from "@/shared/stores/store.ts";

export const adminApi = createApi(
    () => store.getState().auth.token,
    '/admin',
);