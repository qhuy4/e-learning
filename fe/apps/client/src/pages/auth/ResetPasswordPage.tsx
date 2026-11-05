import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, XCircle } from "lucide-react";
import { authService } from "@/features/auth/services/auth.service";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError("This password reset link is invalid or has expired.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await authService.resetPassword({ token, password, confirmPassword });
      setSuccess(true);
    } catch {
      setError("This password reset link is invalid, expired, or already used.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-m3-surface px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-m3-surface-container-lowest p-8 shadow-lg">
        {success ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto size-16 text-[#146a5f]" />
            <h1 className="mt-5 font-headline-lg font-bold text-m3-on-surface">Password updated</h1>
            <p className="mt-2 text-m3-on-surface-variant">Your previous sessions have been signed out. Please sign in with your new password.</p>
            <Link to="/student/login" className="mt-7 inline-flex rounded-full bg-[#F38181] px-6 py-3 font-bold text-white hover:bg-[#e76f6f]">Go to login</Link>
          </div>
        ) : (
          <>
            <KeyRound className="size-12 text-[#F38181]" />
            <h1 className="mt-4 font-headline-lg font-bold text-m3-on-surface">Create a new password</h1>
            <p className="mt-2 text-sm text-m3-on-surface-variant">Use at least 8 characters including uppercase, lowercase, and a special character.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block text-sm font-bold" htmlFor="newPassword">New password</label>
              <div className="relative">
                <input id="newPassword" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} className="h-12 w-full rounded-xl bg-m3-surface-container-low px-4 pr-12 outline-none focus:ring-2 focus:ring-[#F38181]/30" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-m3-on-surface-variant" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              <label className="block text-sm font-bold" htmlFor="confirmPassword">Confirm new password</label>
              <input id="confirmPassword" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type={showPassword ? "text" : "password"} className="h-12 w-full rounded-xl bg-m3-surface-container-low px-4 outline-none focus:ring-2 focus:ring-[#F38181]/30" />
              {error && <p className="flex gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive"><XCircle className="size-5 shrink-0" />{error}</p>}
              <button disabled={submitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#F38181] font-bold text-white disabled:opacity-60">
                {submitting && <Loader2 className="size-5 animate-spin" />} Reset password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
