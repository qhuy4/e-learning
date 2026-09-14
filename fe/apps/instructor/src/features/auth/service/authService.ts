import type {
    LoginRequest,
    LoginResponse,
} from "@/features/auth/types/login";
import {instructorApi} from "@/shared/lib/axios.ts";

export const authService = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await instructorApi.post<LoginResponse>(
            "/auth/login",
            data,
        );

        return response.data;
    },
};
