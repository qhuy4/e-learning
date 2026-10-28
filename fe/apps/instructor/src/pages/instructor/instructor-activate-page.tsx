import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import {
  instructorApplicationService,
  type InstructorActivationView,
} from "@/features/instructor-applications/services/instructor-application.service";
import { InstructorPublicLayout } from "@/pages/instructor/instructor-public-layout";
import { Button, buttonVariants } from "@fe/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fe/components/ui/card";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Spinner } from "@fe/components/ui/spinner";
import { cn } from "@fe/lib/utils";

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as {
    response?: { data?: { error?: { message?: string }; message?: string } };
    message?: string;
  };
  return (
    err.response?.data?.error?.message ||
    err.response?.data?.message ||
    err.message ||
    fallback
  );
}

export default function InstructorActivatePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(Boolean(token));
  const [loadError, setLoadError] = useState<string | null>(
    token
      ? null
      : "Không tìm thấy mã kích hoạt. Vui lòng mở lại liên kết trong email.",
  );
  const [data, setData] = useState<InstructorActivationView | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (!token) return;

    instructorApplicationService
      .getActivation(token)
      .then(setData)
      .catch((err: unknown) => {
        setLoadError(
          getErrorMessage(
            err,
            "Liên kết kích hoạt không hợp lệ hoặc đã hết hạn.",
          ),
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleActivate = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (data?.requiresPassword) {
      if (password.length < 8) {
        setErrorMessage("Mật khẩu phải có ít nhất 8 ký tự.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Mật khẩu xác nhận không khớp.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await instructorApplicationService.activate({
        token,
        password: data?.requiresPassword ? password : undefined,
      });
      setActivated(true);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Kích hoạt tài khoản thất bại."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <InstructorPublicLayout className="max-w-md">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Đang kiểm tra liên kết...
          </div>
        </div>
      </InstructorPublicLayout>
    );
  }

  if (loadError) {
    return (
      <InstructorPublicLayout className="max-w-md">
        <Card className="mt-[10vh]">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldCheck className="size-7" />
            </div>
            <div>
              <CardTitle>Không thể kích hoạt</CardTitle>
              <CardDescription className="mt-1">{loadError}</CardDescription>
            </div>
          </CardContent>
        </Card>
      </InstructorPublicLayout>
    );
  }

  if (activated) {
    return (
      <InstructorPublicLayout className="max-w-md">
        <Card className="mt-[10vh]">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-7" />
            </div>
            <div>
              <CardTitle>Kích hoạt thành công</CardTitle>
              <CardDescription className="mt-1">
                Tài khoản Giảng viên của bạn đã sẵn sàng. Vui lòng đăng nhập để
                tiếp tục.
              </CardDescription>
            </div>
            <Link
              to="/login"
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
            >
              Đăng nhập
            </Link>
          </CardContent>
        </Card>
      </InstructorPublicLayout>
    );
  }

  return (
    <InstructorPublicLayout className="max-w-md">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <KeyRound className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Kích hoạt tài khoản Giảng viên
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hoàn tất thông tin đăng nhập để bắt đầu giảng dạy cùng EduPro.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Thông tin tài khoản</CardTitle>
          <CardDescription className="flex items-center gap-1.5">
            <Mail className="size-3.5" />
            {data?.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
            Xin chào <strong>{data?.fullName || data?.email}</strong>. Hồ sơ của
            bạn đã được duyệt.
          </div>

          <form onSubmit={handleActivate} className="space-y-4">
            {data?.requiresPassword ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mật khẩu mới</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">
                    Xác nhận mật khẩu
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tài khoản đã có mật khẩu. Nhấn kích hoạt để hoàn tất.
              </p>
            )}

            {errorMessage && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner />
                  Đang kích hoạt...
                </>
              ) : (
                "Kích hoạt tài khoản"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </InstructorPublicLayout>
  );
}
