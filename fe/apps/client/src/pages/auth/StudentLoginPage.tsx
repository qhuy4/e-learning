import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useLogin } from "@/features/auth/hooks/use-login";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Flame, TrendingUp, Zap, CheckCircle } from "lucide-react";

export const StudentLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const loginError = loginMutation.error as {
    response?: { data?: { error?: { code?: string; message?: string; details?: { reason?: string | null } } } };
  } | null;
  const loginErrorCode = loginError?.response?.data?.error?.code;
  const loginErrorMessage =
    loginError?.response?.data?.error?.message || "Email hoặc mật khẩu không chính xác.";
  const blockReason = loginError?.response?.data?.error?.details?.reason;

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
    <div className="w-full flex flex-col bg-m3-surface relative">
      <div className="flex flex-col w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative w-full">
          <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* LEFT COLUMN: Brand Welcome & Mascot Showcase */}
            <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-10 rounded-2xl bg-m3-surface-container-low relative overflow-hidden shadow-[0_4px_24px_rgba(45,55,72,0.04)] group/card transition-all duration-300 hover:shadow-[0_8px_30px_rgba(45,55,72,0.08)]">
              <div className="relative z-10 flex flex-col gap-5">
                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 self-start bg-[#FCE38A] text-[#453800] px-3.5 py-1.5 rounded-full shadow-sm select-none cursor-default">
                  <Flame className="size-4 text-[#453800] font-bold" />
                  <span className="font-label-md tracking-wide uppercase font-bold text-[#453800]">Welcome Back Learner</span>
                </div>

                {/* Motivational Headline */}
                <div className="space-y-2">
                  <h1 className="font-headline-lg text-m3-on-surface font-extrabold tracking-tight">
                    Ready to continue your <span className="text-[#F38181]">personalized English</span> journey?
                  </h1>
                  <p className="font-body-md text-m3-on-surface-variant leading-relaxed">
                    Every mindful 10-minute session strengthens your neural speech pathways. Your companion is waiting!
                  </p>
                </div>

                {/* Mascot Display Container */}
                <div className="relative mt-2 flex flex-col items-center">
                  {/* Mascot Dialogue Bubble */}
                  <div className="relative self-end max-w-[270px] bg-[#EAFFD0] border-2 border-[#95E1D3]/50 p-4 rounded-2xl rounded-bl-sm shadow-[0_8px_20px_rgba(243,129,129,0.12)] -mb-4 z-20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(243,129,129,0.18)] cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#F38181] animate-ping" />
                      <span className="font-label-sm text-[#9e3f42] font-bold uppercase tracking-wider">PIE THE RED PANDA</span>
                    </div>
                    <p className="font-body-sm text-slate-800 font-medium leading-snug">"Let's boost your speaking score today! Ready for an accent drill?"</p>
                  </div>

                  {/* Mascot Character Render */}
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-md bg-m3-surface-container-lowest flex items-center justify-center group/mascot transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    <img
                      alt="PiE Mind Red Panda Tutor with tablet and glasses"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/mascot:scale-105"
                      src="https://lh3.googleusercontent.com/aida/AEtjO1U0hQV9LxUXMwsKd10yh1PYxZ6zmf7jItHZusp49RxlkWiOnFjK3xOmYo0FbiT14O-06_aTQiB1y57vuBiWzmEO8o4rrnVPXtVnO_Ybs1dHv6F-I4nusb7kSLZg4G-DyEgIPLH_qWqDoRy7tAJa6TaVuUMDGPHTYIKvca4zsnrVj1UI9vUXrS3l5C-hiqrEZ9h9GV_45L4L6qperOXC4kd6ViFA_z5sIQ3vmrYlbb9q45MckN3dJnJgDw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Quick Stat / Live Learner Metric Card */}
              <div className="relative z-10 mt-6 bg-[#EAFFD0]/70 dark:bg-[#95E1D3]/10 border border-[#95E1D3]/60 p-4 rounded-xl shadow-sm flex items-center justify-between transition-all duration-200 hover:bg-[#EAFFD0]/90 hover:shadow-md hover:-translate-y-0.5 cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#95E1D3] flex items-center justify-center text-[#146a5f] shadow-sm transition-transform duration-200 group-hover:rotate-6">
                    <TrendingUp className="size-5 font-bold" />
                  </div>
                  <div>
                    <p className="font-label-sm text-muted-foreground font-semibold">Your Active Level</p>
                    <p className="font-headline-sm text-foreground font-bold">B1 &bull; Intermediate</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 font-label-md text-[#453800] font-bold bg-[#FCE38A] px-2.5 py-1 rounded-full shadow-sm">
                    <Zap className="size-3.5 text-[#453800] fill-current" /> 14 Days
                  </span>
                  <p className="font-label-sm text-muted-foreground font-medium mt-1">Study Streak</p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sign In Form Interface */}
            <div className="lg:col-span-7 flex flex-col justify-center p-8 sm:p-12 rounded-2xl bg-m3-surface-container-lowest shadow-[0_8px_32px_rgba(45,55,72,0.06)] relative">
              <div className="max-w-lg w-full mx-auto space-y-7">
                {/* Form Header */}
                <div className="space-y-1">
                  <h2 className="font-headline-lg text-m3-on-surface font-bold tracking-tight">Log in to PiEMind</h2>
                  <p className="font-body-md text-m3-on-surface-variant">Welcome back! Please enter your details to resume practice.</p>
                </div>

                {/* Social Login Hub */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    className="flex items-center justify-center gap-3 px-4 py-3 rounded-full bg-m3-surface-container-low border border-border hover:bg-muted hover:border-input active:scale-[0.99] transition-all duration-200 text-m3-on-surface font-label-lg"
                    type="button"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z" fill="#EA4335" />
                      <path d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" fill="#4285F4" />
                      <path d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.1 0 12s.6 3.6 1.6 5.6l3.7-2.9z" fill="#FBBC05" />
                      <path d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z" fill="#34A853" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                  <button
                    className="flex items-center justify-center gap-3 px-4 py-3 rounded-full bg-m3-surface-container-low border border-border hover:bg-muted hover:border-input active:scale-[0.99] transition-all duration-200 text-m3-on-surface font-label-lg"
                    type="button"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.77 1.04-1.84.93-2.91-.9.04-2 .6-2.64 1.36-.57.65-1.06 1.74-.93 2.78 1.01.08 2.02-.46 2.64-1.23z" />
                    </svg>
                    <span>Continue with Apple</span>
                  </button>
                </div>

                {/* Divider with Tactile Pill */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="w-full h-px bg-m3-surface-variant" />
                  <span className="absolute bg-m3-surface-container-lowest px-4 font-label-sm text-m3-on-surface-variant uppercase tracking-wider font-semibold">
                    or log in with email
                  </span>
                </div>

                {/* Error Banner */}
                {loginMutation.isError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2 font-body-sm font-semibold">
                    <CheckCircle className="size-5 text-destructive" />
                    <div>
                      <p>{loginErrorMessage}</p>
                      {loginErrorCode === "EMAIL_VERIFICATION_REQUIRED" && (
                        <Link
                          className="mt-1 inline-block underline"
                          to={`/student/verify-email?email=${encodeURIComponent(email)}`}
                        >
                          Resend verification email
                        </Link>
                      )}
                      {loginErrorCode === "ACCOUNT_BLOCKED" && blockReason && (
                        <p className="mt-1 text-sm font-normal">Reason: {blockReason}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Interactive Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Input Field */}
                  <div className="space-y-1.5 text-left">
                    <label className="block font-label-md text-m3-on-surface font-semibold" htmlFor="emailInput">
                      Email Address
                    </label>
                    <div className="relative flex items-center group/field border border-transparent rounded-xl hover:border-input focus-within:border-[#f38181] focus-within:ring-2 focus-within:ring-[#f38181]/20 transition-all duration-200">
                      <Mail className="size-5 absolute left-4 text-m3-on-surface-variant group-focus-within/field:text-[#F38181] transition-colors duration-200 pointer-events-none" />
                      <input
                        className="w-full h-[52px] pl-12 pr-4 bg-m3-surface-container-low rounded-xl text-m3-on-surface font-body-md focus:bg-m3-surface-container-lowest focus:outline-none border-none ring-0 focus:ring-0 shadow-sm transition-all placeholder:text-m3-on-surface-variant/50"
                        id="emailInput"
                        placeholder="alex@example.com"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password Input Field with Toggle */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="block font-label-md text-m3-on-surface font-semibold" htmlFor="passwordInput">
                        Password
                      </label>
                      <Link className="font-label-md text-[#F38181] font-bold hover:text-[#e06666] hover:underline transition-colors duration-150" to="/student/forgot-password">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative flex items-center group/field border border-transparent rounded-xl hover:border-input focus-within:border-[#f38181] focus-within:ring-2 focus-within:ring-[#f38181]/20 transition-all duration-200">
                      <Lock className="size-5 absolute left-4 text-m3-on-surface-variant group-focus-within/field:text-[#F38181] transition-colors duration-200 pointer-events-none" />
                      <input
                        className="w-full h-[52px] pl-12 pr-12 bg-m3-surface-container-low rounded-xl text-m3-on-surface font-body-md focus:bg-m3-surface-container-lowest focus:outline-none border-none ring-0 focus:ring-0 shadow-sm transition-all placeholder:text-m3-on-surface-variant/50"
                        id="passwordInput"
                        placeholder="••••••••"
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        aria-label="Toggle password visibility"
                        className="absolute right-3.5 p-1 rounded-lg text-m3-on-surface-variant hover:text-m3-on-surface focus:outline-none transition-colors duration-150 active:scale-95"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Row */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                      <input
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded accent-m3-primary cursor-pointer focus:ring-0 transition-transform group-hover:scale-105"
                        type="checkbox"
                      />
                      <span className="font-body-sm text-m3-on-surface-variant group-hover:text-m3-on-surface transition-colors duration-150 font-medium">Remember me for 30 days</span>
                    </label>
                  </div>

                  {/* Primary Submission Button */}
                  <button
                    className="w-full h-[52px] rounded-full bg-[#F38181] hover:bg-[#e76f6f] text-white font-label-lg font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-1 active:shadow-none transition-all duration-200 ease-out disabled:opacity-60"
                    type="submit"
                    disabled={loginMutation.isPending}
                  >
                    <span>{loginMutation.isPending ? "Verifying..." : "Sign In"}</span>
                    {loginMutation.isPending ? <Loader2 className="size-5 animate-spin" /> : <ArrowRight className="size-5 font-bold" />}
                  </button>
                </form>

                {/* Bottom Switcher to Register */}
                <div className="text-center pt-2">
                  <p className="font-body-sm text-m3-on-surface-variant">
                    Don't have an account?{" "}
                    <Link className="font-label-lg text-[#F38181] font-bold hover:text-[#e06666] hover:underline transition-colors duration-150 ml-1" to="/student/register">
                      Sign up for free
                    </Link>
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
