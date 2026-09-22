import { Link } from "react-router";
import { Sparkles, ArrowRight, Compass, Star, CheckCircle, BookOpen, Mic, CircleAlert, Target } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-m3-surface py-8 lg:py-24">
      <div className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-m3-secondary-fixed opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-m3-primary-fixed opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 bottom-0 h-64 w-64 rounded-full bg-m3-tertiary-fixed opacity-40 blur-2xl" />

      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 shadow-sm border border-m3-secondary">
              <span className="font-label-md flex items-center gap-1.5 font-bold text-m3-secondary">
                <Sparkles className="w-4 h-4 text-m3-secondary" />
                AI-powered English learning
              </span>
            </div>

            <h1 className="font-display-lg text-m3-on-surface tracking-tight max-w-xl font-extrabold">
              Learn English that{" "}
              <span className="text-m3-primary-container relative inline-block">
                fits you.
                <svg className="absolute -bottom-2 left-0 w-full text-m3-primary-container/40" height="8" preserveAspectRatio="none" viewBox="0 0 100 8">
                  <path d="M0,5 Q50,0 100,5" fill="transparent" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
                </svg>
              </span>
            </h1>

            <p className="font-body-lg text-m3-on-surface-variant max-w-lg leading-relaxed">
              PiEMind uses AI to understand your English strengths and weaknesses, then connects you with the right learning path, courses, and teachers.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                to="/courses"
                className="font-label-lg bg-m3-primary-container text-m3-on-primary rounded-full px-8 py-4 hover:bg-m3-primary/90 transition-all flex items-center gap-2"
              >
                Take Placement Test
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/courses"
                className="font-label-lg bg-m3-surface-container-lowest text-m3-on-surface rounded-full px-7 py-3.5 shadow-sm hover:shadow-md hover:bg-m3-surface-container-low transition-all flex items-center gap-2"
              >
                Explore Courses
                <Compass className="w-[18px] h-[18px] text-m3-on-surface-variant" />
              </Link>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center text-m3-tertiary">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="font-label-md text-m3-on-surface-variant">
                <strong className="text-m3-on-surface font-headline-sm">4.9/5</strong> from 12,000+ active learners
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 relative flex justify-center items-center mt-10 lg:mt-0">
            <div className="relative w-full max-w-[480px]">
              <div className="relative z-10 w-full rounded-2xl overflow-hidden shadow-md bg-m3-surface-container-lowest">
                <img
                  alt="PiEMind Red Panda mascot studying on tablet"
                  className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnUfyOx8zHRsgIU7JVD1Gn-VCMIXnZgtAQH10V0Xeayvg8MzYHCf4-dVDlRpxiJqjfRvcGtwXMJs7IrdykM6vfzlXVEHnKIYdqmiUVlG7BKzbprdlJ3IdNNQKNmIS-0u80sfmooeBfSgAr9BJxNvExSvVF7dAaUvzf4cunj1uk_00eBK-Z3r8Zl9U0k0KwN-Exze1ZgqjqjEVE5Q3pIgWSNaZrHPI_CAJ8P7NW_P-aT9ncNe3FZs9w"
                />
              </div>

              <div className="absolute -top-6 -left-6 z-20 bg-m3-surface-container-lowest/95 backdrop-blur-md rounded-2xl p-4 shadow-lg flex flex-col gap-2 min-w-[170px] transform -rotate-2 hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-m3-on-surface flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-m3-tertiary" />
                    Grammar
                  </span>
                  <span className="font-label-md font-bold text-m3-tertiary">72%</span>
                </div>
                <div className="w-full bg-m3-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-m3-tertiary-fixed h-full rounded-full" style={{ width: "72%" }} />
                </div>
              </div>

              <div className="absolute -top-4 -right-6 z-20 bg-m3-surface-container-lowest/95 backdrop-blur-md rounded-2xl p-4 shadow-lg flex flex-col gap-2 min-w-[170px] transform rotate-3 hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-m3-on-surface flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-m3-secondary" />
                    Vocabulary
                  </span>
                  <span className="font-label-md font-bold text-m3-secondary">81%</span>
                </div>
                <div className="w-full bg-m3-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-m3-secondary-fixed-dim h-full rounded-full" style={{ width: "81%" }} />
                </div>
              </div>

              <div className="absolute -bottom-8 -left-8 z-20 bg-m3-surface-container-lowest/95 backdrop-blur-md rounded-2xl p-4 shadow-xl flex flex-col gap-2 min-w-[190px] transform rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-m3-on-surface flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-m3-primary" />
                    Speaking
                  </span>
                  <span className="font-label-md font-bold text-m3-primary">54%</span>
                </div>
                <div className="w-full bg-m3-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-m3-primary-container h-full rounded-full" style={{ width: "54%" }} />
                </div>
                <span className="font-label-sm text-m3-primary font-bold flex items-center gap-1">
                  <CircleAlert className="w-3.5 h-3.5" /> Priority Focus
                </span>
              </div>

              <div
                className="absolute bottom-16 -right-6 z-20 backdrop-blur-md rounded-full px-5 py-2.5 shadow-lg flex items-center gap-2 border"
                style={{ backgroundColor: "#ffff", borderColor: "rgba(149, 225, 211, 0.6)", color: "rgb(30, 41, 59)" }}
              >
                <span className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: "#146a5f" }} />
                <span className="font-label-sm uppercase tracking-wider font-bold" style={{ color: "#1e293b" }}>Level</span>
                <span className="font-headline-sm font-bold" style={{ color: "#1e293b" }}>B1</span>
              </div>

              <div
                className="absolute -bottom-6 right-6 z-20 rounded-full px-4 py-2 shadow-md flex items-center gap-1.5 border"
                style={{ backgroundColor: "#ffff", borderColor: "rgb(149, 225, 211)", color: "rgb(20, 106, 95)" }}
              >
                <Target className="w-4 h-4" />
                <span className="font-label-sm font-bold">Recommended: Speaking Practice</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
