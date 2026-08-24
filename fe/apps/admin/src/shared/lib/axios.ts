import { createApi } from "@fe/lib/axios.v.ts";
import { store } from "@/shared/stores/store.ts";

export const axios = createApi(() => {
    return store.getState().auth.token;
});