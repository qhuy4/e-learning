import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, Loader2, Mail, RefreshCw, XCircle } from "lucide-react";
import { authService } from "@/features/auth/services/auth.service";

type VerificationState = "idle" | "verifying" | "success" | "error";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const initialEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState<VerificationState>(token ? "verifying" : "idle");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (!token || verificationStarted.current) return;
    verificationStarted.current = true;
    authService.verifyEmail(token).then(
      () => setState("success"),
      () => setState("error"),
    );
  }, [token]);

  const resend = async (event: React.FormEvent) => {
    event.preventDefault();
    setResending(true);
    setResent(false);
    try {
      await authService.resendVerification(email);
      setResent(true);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-m3-surface">
      <div className="w-full max-w-lg rounded-2xl bg-m3-surface-container-lowest p-8 sm:p-10 shadow-lg text-center">
        {state === "verifying" && (
          <>
            <Loader2 className="mx-auto size-14 animate-spin text-[#F38181]" />
            <h1 className="mt-5 font-headline-lg font-bold">Verifying your email...</h1>
            <p className="mt-2 text-m3-on-surface-variant">Please wait a moment.</p>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle2 className="mx-auto size-16 text-[#146a5f]" />
            <h1 className="mt-5 font-headline-lg font-bold">Email verified</h1>
            <p className="mt-2 text-m3-on-surface-variant">Your account is now active. You can sign in.</p>
            <Link to="/student/login" className="mt-7 inline-flex rounded-full bg-[#F38181] px-6 py-3 font-bold text-white hover:bg-[#e76f6f]">
              Go to login
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="mx-auto size-16 text-red-500" />
            <h1 className="mt-5 font-headline-lg font-bold">Verification link is invalid</h1>
            <p className="mt-2 text-m3-on-surface-variant">The link may have expired. Request a new email below.</p>
          </>
        )}

        {(state === "idle" || state === "error") && (
          <form onSubmit={resend} className="mt-7 space-y-4 text-left">
            <label className="block font-semibold" htmlFor="verificationEmail">Email address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-m3-on-surface-variant" />
              <input
                id="verificationEmail"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-[52px] w-full rounded-xl bg-m3-surface-container-low pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#F38181]/30"
                placeholder="you@example.com"
              />
            </div>
            {resent && <p className="text-sm font-semibold text-[#146a5f]">If this account is awaiting verification, a new email has been sent.</p>}
            <button disabled={resending} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F38181] px-6 py-3 font-bold text-white disabled:opacity-60">
              {resending ? <Loader2 className="size-5 animate-spin" /> : <RefreshCw className="size-5" />}
              Resend verification email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
