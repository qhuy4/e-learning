import {useState} from "react";
import type {LoginRequest} from "@/features/auth/types/login";
import {authService} from "@/features/auth/service/authService.ts";
import {setAuth} from "@/features/auth/store/authSlice";
import { useDispatch } from "react-redux";

export function useLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch();
    const login = async (data: LoginRequest) => {
        try {
            setLoading(true);
            setError(null);

            const result = await authService.login(data);

            const loginResp = result.data;

            dispatch(
                setAuth({
                    token: loginResp.accessToken,
                    user: loginResp.user,
                })
            );

            localStorage.setItem(
                "accessToken",
                loginResp.accessToken,
            );
            localStorage.setItem(
                "user",
                JSON.stringify(loginResp.user)
            );
            return loginResp;
        } catch (error: any) {
            setError(
                error.response?.data?.error?.message
                || error.response?.data?.message
                || "Email hoặc mật khẩu không chính xác",
            );
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        login,
        loading,
        error,
    };
}
