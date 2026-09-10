import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { useAuth } from "./use-auth";
import type { LoginPayload } from "../types/auth.type";

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      login(data.accessToken, data.user);
    },
  });
};
