import type {
    LoginRequest,
    LoginResponse,
} from "@/features/auth/types/login";
import { adminApi } from "@/shared/lib/axios";

export const authService = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await adminApi.post<LoginResponse>(
            "/auth/login",
            data,
        );

        return response.data;
    },
};

