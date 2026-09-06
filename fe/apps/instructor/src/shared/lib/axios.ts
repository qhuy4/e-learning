import { createApi } from "@fe/lib/axios.v.ts";
import { store } from "@/shared/stores/store.ts";

export const instructorApi = createApi(
    () => store.getState().auth.token,
    '/admin',
);
