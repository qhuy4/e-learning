import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { GraduationCap } from "lucide-react";
import { useLogin } from "../hooks/use-login";
import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";

export const StudentLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const redirectTo = searchParams.get("redirect") || "/";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate(redirectTo, { replace: true });
        },
      },
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-400 rounded-2xl mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Đăng nhập tài khoản
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Chào mừng bạn đến với E-Learning
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {loginMutation.isError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              Email hoặc mật khẩu không chính xác.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-6"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Chưa có tài khoản?{" "}
            <a
              href="/register"
              className="text-rose-500 font-semibold hover:underline"
            >
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
