import { useState } from "react";
import { Link } from "react-router";
import { authService } from "@/features/auth/services/auth.service";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Flame,
  Heart,
  Lock,
  Mail,
  MailCheck,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Headphones,
} from "lucide-react";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [method] = useState<"magic">("magic");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError("Unable to send reset instructions right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-m3-surface relative">
      <div className="flex flex-col w-full pt-8 md:pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative w-full">
          <div className="absolute -top-12 left-1/4 w-72 h-72 bg-[#a4f1e3]/40 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute -bottom-10 right-1/4 w-80 h-80 bg-[#f38181]/20 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="w-full bg-white rounded-xl  overflow-hidden grid grid-cols-1 lg:grid-cols-12 ">
            {/* LEFT: Mascot Panel - fixed height, no layout shift */}
            <section className="lg:col-span-5 bg-gradient-to-br from-m3-surface-container-low via-m3-surface-container to-[#a4f1e3]/20 p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden h-full ">
              <div className="absolute top-0 right-0 w-44 h-44 bg-[#a4f1e3]/30 rounded-full -mr-16 -mt-16 blur-xl pointer-events-none" />
              <div className="absolute bottom-16 -left-10 w-36 h-36 bg-[#fae189]/30 rounded-full blur-lg pointer-events-none" />



              {/* Mascot */}
              <div className="relative z-10 my-6 flex flex-col items-center">
                <div className="self-start -mb-4 z-20 shadow-md bg-[#146a5f] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-bounce" style={{ animationDuration: "3s" }}>
                  <ShieldCheck className="size-4" />
                  <span className="font-bold tracking-wide text-xs">Level: B1 Intermediate</span>
                </div>
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-lg overflow-hidden bg-white shadow-md flex items-center justify-center p-2">
                  <img
                    alt="Pie the Red Panda Tutor"
                    className="w-full h-full object-cover rounded transform hover:scale-105 transition-transform duration-500 ease-out"
                    src="https://lh3.googleusercontent.com/aida/AEtjO1U0hQV9LxUXMwsKd10yh1PYxZ6zmf7jItHZusp49RxlkWiOnFjK3xOmYo0FbiT14O-06_aTQiB1y57vuBiWzmEO8o4rrnVPXtVnO_Ybs1dHv6F-I4nusb7kSLZg4G-DyEgIPLH_qWqDoRy7tAJa6TaVuUMDGPHTYIKvca4zsnrVj1UI9vUXrS3l5C-hiqrEZ9h9GV_45L4L6qperOXC4kd6ViFA_z5sIQ3vmrYlbb9q45MckN3dJnJgDw"
                  />
                </div>
                {/* Thought Card */}
                <div className="mt-6 w-full bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-sm">
                  <div className="flex items-start gap-2">
                    <Heart className="size-5 text-[#F38181] flex-shrink-0 mt-0.5" />
                    <p className="text-m3-on-surface-variant italic leading-relaxed text-sm">
                      "Don't worry! We'll get you back to your <span className="font-bold text-[#F38181]">14-day streak</span> in no time. Your learning progress is safely saved."
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between pt-2">
                    <span className="text-m3-on-surface-variant font-semibold text-xs">— Pie, your study partner</span>
                    <span className="inline-flex items-center text-xs font-bold text-[#146a5f] gap-0.5">
                      <Flame className="size-3" /> 14 Days
                    </span>
                  </div>
                </div>
              </div>
              
            </section>

            {/* RIGHT: Form Panel */}
            <section className="lg:col-span-7 lg:px-8  flex flex-col justify-between bg-white">
              <div>
                {/* Header Controls */}
                <div className="flex items-center justify-between mb-6">
                  <Link
                    to="/student/login"
                    className="inline-flex items-center gap-1.5 text-[#146a5f] hover:text-[#1e7065] transition-colors font-bold group"
                  >
                    <ArrowLeft className="size-5 transform group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Sign In</span>
                  </Link>
                  <div className="flex items-center gap-1 bg-m3-surface-container-low px-2.5 py-1 rounded-full text-m3-on-surface-variant text-xs font-semibold">
                    <Lock className="size-3.5 text-[#146a5f]" />
                    <span>256-bit TLS</span>
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-1 mb-6">
                  <h1 className="font-headline-lg text-m3-on-surface tracking-tight">Forgot your password?</h1>
                  <p className="font-body-md text-m3-on-surface-variant text-base">
                    Enter the email associated with your PiEMind account, and we'll send you an instant reset link or secure PIN.
                  </p>
                </div>

                {/* Form */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Method Tabs */}
                  <div className="space-y-1.5">
                    <label className="text-m3-on-surface-variant font-bold block text-xs uppercase tracking-wider">Reset Method</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-1 bg-m3-surface-container rounded-full">
                      <button
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs font-bold transition-all ${
                          method === "magic"
                            ? "bg-[#95E1D3] text-[#146a5f] shadow-sm"
                            : "text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-white/50"
                        }`}
                        type="button"
                      >
                        <MailCheck className="size-4" />
                        <span>Magic Reset Link</span>
                        <span className="bg-white/40 text-[#146a5f] text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">Recommended</span>
                      </button>
                      <button
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs font-bold text-m3-on-surface-variant opacity-60 cursor-not-allowed"
                        type="button"
                        disabled
                      >
                        <MessageSquare className="size-4" />
                        <span>6-digit SMS / OTP Code</span>
                      </button>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-m3-on-surface font-bold" htmlFor="recovery-email">Email Address</label>
                      <span className="text-xs text-[#146a5f] font-semibold">Account identity verified</span>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="size-5 text-m3-on-surface-variant group-focus-within:text-[#146a5f] transition-colors" />
                      </div>
                      <input
                        className="w-full pl-11 pr-11 py-3 bg-m3-surface-container-low text-m3-on-surface rounded-full font-body-md text-sm transition-all outline-none focus:bg-white focus:shadow-md ring-0"
                        id="recovery-email"
                        placeholder="name@domain.com"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      {email && (
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#146a5f]">
                          <CheckCircle className="size-5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phone Field (SMS mode) */}
                  <div className="hidden space-y-1">
                    <label className="text-m3-on-surface font-bold" htmlFor="recovery-phone">Registered Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Smartphone className="size-5 text-m3-on-surface-variant" />
                      </div>
                      <input
                        className="w-full pl-11 pr-4 py-3 bg-m3-surface-container-low text-m3-on-surface rounded-full font-body-md text-sm transition-all outline-none focus:bg-white focus:shadow-md"
                        id="recovery-phone"
                        placeholder="+84 (555) 019-2834"
                        type="tel"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    className="w-full mt-2 py-3.5 px-6 rounded-full bg-[#f38181] hover:bg-[#e76f6f] active:scale-[0.99] text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    type="submit"
                    disabled={submitted || submitting}
                  >
                    <span>{submitting ? "Sending..." : "Send Password Reset Link"}</span>
                    <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Success Banner */}
                  {submitted && (
                    <div className="p-4 bg-[#EAFFD0] rounded-full flex items-start gap-3 text-[#146a5f]">
                      <MailCheck className="size-6 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[#1e7065]">Check your inbox!</p>
                        <p className="text-xs text-[#1e7065] leading-relaxed">
                          We've dispatched password recovery steps to <strong>{email || "your registered account"}</strong>.
                        </p>
                      </div>
                    </div>
                  )}
                  {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}
                </form>

                {/* Alternative Actions */}
                <div className="mt-6 pt-4 bg-m3-surface-container-low/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-m3-on-surface-variant">Remembered your password?</span>
                    <Link to="/student/login" className="text-[#F38181] font-bold hover:underline">Sign In directly</Link>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-m3-on-surface-variant">Need urgent human assistance?</span>
                    <a className="text-[#146a5f] font-bold hover:underline inline-flex items-center gap-1" href="mailto:support@piemind.ai">
                      <Headphones className="size-3" />
                      <span>support@piemind.ai</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
