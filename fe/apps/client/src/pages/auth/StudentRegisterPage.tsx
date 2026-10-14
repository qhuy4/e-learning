import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { authService } from "@/features/auth/services/auth.service";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle,
  BarChart3,
  Target,
} from "lucide-react";

export const StudentRegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const passwordStrength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/\d/.test(password)) score++;
    if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel =
    password.length === 0
      ? "Weak"
      : passwordStrength === 1
        ? "Weak"
        : passwordStrength === 2
          ? "Good"
          : "Strong";

  const strengthColor =
    password.length === 0
      ? "text-m3-on-surface-variant"
      : passwordStrength === 1
        ? "text-m3-primary"
        : passwordStrength === 2
          ? "text-m3-tertiary"
          : "text-m3-secondary";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;
    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await authService.register({ name: fullName, email, password, confirmPassword });
      navigate(`/student/verify-email?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Unable to create your account. The email may already be registered or the password is invalid.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-m3-surface relative">
      <div className="flex flex-col w-full flex-1">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* LEFT COLUMN: Inspiring Journey Showcase */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-m3-surface-container-low p-8 lg:p-10 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md  group">
              <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-m3-secondary-container/40 blur-3xl pointer-events-none transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute -left-12 bottom-12 w-48 h-48 rounded-full bg-m3-primary-container/20 blur-2xl pointer-events-none transition-transform duration-500 group-hover:scale-110" />

              <div className="relative z-10">
                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE38A] text-[#453800] font-bold mb-6 shadow-sm">
                  <Sparkles className="size-4 text-[#453800]" />
                  <span>Start Free Today</span>
                </div>

                {/* Headline */}
                <h1 className="font-headline-lg text-m3-on-surface tracking-tight mb-4">
                  Discover your true English potential with AI.
                </h1>
                <p className="font-body-md text-m3-on-surface-variant mb-8">
                  Empathetic, structured language acquisition tailored to your
                  exact pace. No stress, just steady daily growth.
                </p>

                {/* Feature Cards */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3 bg-[#EAFFD0]/70 border border-[#95E1D3] p-3.5 rounded-xl shadow-sm transition-all duration-200 hover:bg-[#EAFFD0]/90 hover:shadow-md hover:-translate-y-0.5 cursor-default">
                    <div className="w-7 h-7 rounded-full bg-[#95E1D3] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <CheckCircle className="size-4 text-[#146a5f]" />
                    </div>
                    <div>
                      <p className="font-bold text-m3-on-surface">
                        Free 10-minute diagnostic test
                      </p>
                      <p className="text-sm text-m3-on-surface/80">
                        Adaptive CEFR level evaluation built for real-world speech.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#EAFFD0]/70 border border-[#95E1D3] p-3.5 rounded-xl shadow-sm transition-all duration-200 hover:bg-[#EAFFD0]/90 hover:shadow-md hover:-translate-y-0.5 cursor-default">
                    <div className="w-7 h-7 rounded-full bg-[#95E1D3] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <BarChart3 className="size-4 text-[#146a5f]" />
                    </div>
                    <div>
                      <p className="font-bold text-m3-on-surface">
                        Skill breakdown matrix
                      </p>
                      <p className="text-sm text-m3-on-surface/80">
                        Instant visibility into pronunciation nuance and grammar mastery.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#EAFFD0]/70 border border-[#95E1D3] p-3.5 rounded-xl shadow-sm transition-all duration-200 hover:bg-[#EAFFD0]/90 hover:shadow-md hover:-translate-y-0.5 cursor-default">
                    <div className="w-7 h-7 rounded-full bg-[#95E1D3] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Target className="size-4 text-[#146a5f]" />
                    </div>
                    <div>
                      <p className="font-bold text-m3-on-surface">
                        Personalized roadmaps
                      </p>
                      <p className="text-sm text-m3-on-surface/80">
                        Precision recommendations for courses and human coaching.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mascot Showcase Module */}
              <div className="relative z-10 mt-6 bg-m3-surface-container-lowest p-5 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-200 hover:shadow-md cursor-default">
                <div className="relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-[#95E1D3]/20 border border-[#95E1D3]/40 shadow-inner">
                  <img
                    alt="PiEMind 3D red panda mascot with glasses and teal scarf"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida/AEtjO1U0hQV9LxUXMwsKd10yh1PYxZ6zmf7jItHZusp49RxlkWiOnFjK3xOmYo0FbiT14O-06_aTQiB1y57vuBiWzmEO8o4rrnVPXtVnO_Ybs1dHv6F-I4nusb7kSLZg4G-DyEgIPLH_qWqDoRy7tAJa6TaVuUMDGPHTYIKvca4zsnrVj1UI9vUXrS3l5C-hiqrEZ9h9GV_45L4L6qperOXC4kd6ViFA_z5sIQ3vmrYlbb9q45MckN3dJnJgDw"
                  />
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAFFD0] text-[#146a5f] font-bold text-xs mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#95E1D3]" />
                    AI Companion by your side
                  </div>
                  <p className="text-sm text-m3-on-surface font-medium truncate">
                    "Let's build speaking confidence together!"
                  </p>
                  <p className="text-xs text-m3-on-surface-variant">
                    Active 24/7 for micro-lessons
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Registration Form */}
            <div className="lg:col-span-7 bg-m3-surface-container-lowest rounded-2xl p-6 sm:p-10 shadow-sm">
              <div className="max-w-xl mx-auto w-full">
                {/* Form Header */}
                <div className="mb-8">
                  <h2 className="font-headline-lg text-m3-on-surface mb-2 tracking-tight">
                    Create your free account
                  </h2>
                  <p className="font-body-md text-m3-on-surface-variant">
                    Join 12,000+ active learners mastering English without pressure.
                  </p>
                </div>

                {/* Social Signup Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <button
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-full bg-m3-surface-container-low border border-transparent hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:scale-[0.99] text-m3-on-surface font-label-lg transition-all duration-200 cursor-pointer"
                    type="button"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" fill="#4285F4" />
                      <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" fill="#34A853" />
                      <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15Z" fill="#FBBC05" />
                      <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" fill="#EA4335" />
                    </svg>
                    <span>Sign up with Google</span>
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-full bg-m3-surface-container-low border border-transparent hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:scale-[0.99] text-m3-on-surface font-label-lg transition-all duration-200 cursor-pointer"
                    type="button"
                  >
                    <svg className="w-5 h-5 shrink-0 fill-current text-m3-on-surface" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8.93-2.85-.9.04-1.99.6-2.64 1.35-.57.65-1.07 1.72-.94 2.74 1 .08 2.03-.49 2.65-1.24Z" />
                    </svg>
                    <span>Sign up with Apple</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-6">
                  <div className="w-full h-px bg-m3-surface-variant" />
                  <span className="absolute px-4 bg-m3-surface-container-lowest font-label-sm text-m3-on-surface-variant uppercase tracking-wider">
                    or continue with email
                  </span>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block font-label-md text-m3-on-surface mb-1.5" htmlFor="fullName">
                      Full Name
                    </label>
                    <div className="relative flex items-center rounded-xl border border-transparent hover:border-slate-300 focus-within:border-[#f38181] focus-within:ring-2 focus-within:ring-[#f38181]/20 transition-all duration-200">
                      <User className="size-5 absolute left-4 text-m3-on-surface-variant pointer-events-none" />
                      <input
                        className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-m3-surface-container-low text-m3-on-surface placeholder:text-m3-on-surface-variant focus:outline-none focus:bg-m3-surface-container-lowest border-0 font-body-md transition-all duration-200"
                        id="fullName"
                        placeholder="e.g. Kai Takahashi"
                        required
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block font-label-md text-m3-on-surface mb-1.5" htmlFor="emailInput">
                      Email Address
                    </label>
                    <div className="relative flex items-center rounded-xl border border-transparent hover:border-slate-300 focus-within:border-[#f38181] focus-within:ring-2 focus-within:ring-[#f38181]/20 transition-all duration-200">
                      <Mail className="size-5 absolute left-4 text-m3-on-surface-variant pointer-events-none" />
                      <input
                        className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-m3-surface-container-low text-m3-on-surface placeholder:text-m3-on-surface-variant focus:outline-none focus:bg-m3-surface-container-lowest border-0 font-body-md transition-all duration-200"
                        id="emailInput"
                        placeholder="kai@example.com"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-label-md text-m3-on-surface" htmlFor="passwordInput">
                        Password
                      </label>
                      <span className="font-label-sm text-m3-on-surface-variant">
                        At least 8 chars & 1 number
                      </span>
                    </div>
                    <div className="relative flex items-center rounded-xl border border-transparent hover:border-slate-300 focus-within:border-[#f38181] focus-within:ring-2 focus-within:ring-[#f38181]/20 transition-all duration-200">
                      <Lock className="size-5 absolute left-4 text-m3-on-surface-variant pointer-events-none" />
                      <input
                        className="w-full h-[52px] pl-12 pr-12 rounded-xl bg-m3-surface-container-low text-m3-on-surface placeholder:text-m3-on-surface-variant focus:outline-none focus:bg-m3-surface-container-lowest border-0 font-body-md transition-all duration-200"
                        id="passwordInput"
                        placeholder="••••••••"
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        aria-label="Toggle password visibility"
                        className="absolute right-4 text-m3-on-surface-variant hover:text-m3-on-surface transition-colors flex items-center cursor-pointer p-1 rounded-full hover:bg-slate-200/50"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>

                    {/* Password Strength Bar */}
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="h-1.5 flex-1 rounded-full bg-m3-surface-container-high overflow-hidden">
                        <div
                          className="h-full bg-m3-primary-container transition-all"
                          style={{ width: password.length === 0 ? "0%" : passwordStrength >= 1 ? "100%" : "0%" }}
                        />
                      </div>
                      <div className="h-1.5 flex-1 rounded-full bg-m3-surface-container-high overflow-hidden">
                        <div
                          className="h-full bg-m3-tertiary-fixed transition-all"
                          style={{ width: passwordStrength >= 2 ? "100%" : "0%" }}
                        />
                      </div>
                      <div className="h-1.5 flex-1 rounded-full bg-m3-surface-container-high overflow-hidden">
                        <div
                          className="h-full bg-m3-secondary-fixed-dim transition-all"
                          style={{ width: passwordStrength >= 3 ? "100%" : "0%" }}
                        />
                      </div>
                      <span className={`ml-2 font-label-sm ${strengthColor} shrink-0`}>
                        {strengthLabel}
                      </span>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div>
                    <label className="block font-label-md text-m3-on-surface mb-1.5" htmlFor="confirmPasswordInput">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center rounded-xl border border-transparent hover:border-slate-300 focus-within:border-[#f38181] focus-within:ring-2 focus-within:ring-[#f38181]/20">
                      <Lock className="size-5 absolute left-4 text-m3-on-surface-variant pointer-events-none" />
                      <input
                        className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-m3-surface-container-low focus:outline-none"
                        id="confirmPasswordInput"
                        required
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}

                  {/* Terms Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                      <input
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded accent-[#F38181] focus:ring-0 cursor-pointer transition-colors"
                        required
                        type="checkbox"
                      />
                      <span className="font-body-sm text-m3-on-surface-variant transition-colors group-hover:text-m3-on-surface">
                        I agree to PiEMind's{" "}
                        <a className="text-m3-primary hover:text-[#e06666] hover:underline transition-colors duration-150" href="#">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a className="text-m3-primary hover:text-[#e06666] hover:underline transition-colors duration-150" href="#">
                          Privacy Policy
                        </a>.
                      </span>
                    </label>
                  </div>

                  {/* Primary CTA Button */}
                  <div className="pt-2">
                    <button
                      className={`w-full py-3.5 px-6 rounded-full text-white font-bold text-headline-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                        agreedToTerms
                          ? "bg-[#F38181] hover:bg-[#e76f6f] hover:shadow-lg hover:shadow-[#f38181]/25 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                          : "bg-[#F38181]/60 cursor-not-allowed"
                      }`}
                      type="submit"
                      disabled={!agreedToTerms || isSubmitting}
                    >
                      <span>{isSubmitting ? "Creating account..." : "Get Started Free"}</span>
                      <ArrowRight className="size-5" />
                    </button>
                  </div>
                </form>

                {/* Bottom Switcher */}
                <div className="text-center mt-6">
                  <p className="font-body-md text-m3-on-surface-variant">
                    Already have an account?{" "}
                    <Link
                      className="text-m3-primary hover:text-[#e06666] hover:underline font-label-lg transition-colors duration-150 ml-1 inline-block"
                      to="/student/login"
                    >
                      Log In
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
