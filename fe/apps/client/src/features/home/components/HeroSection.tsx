import { Sparkles, ArrowRight, Compass, Star } from "lucide-react";
import { useI18n } from "@/i18n/use-i18n";

export const HeroSection = () => {
  const { t } = useI18n();
  return (
    <section className="relative w-full bg-m3-surface border-b border-m3-surface-container py-12 lg:py-20">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col items-start max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAFFD0] text-[#146a5f] text-xs font-bold tracking-wide uppercase mb-6">
              <Sparkles className="w-4 h-4" />
              {t("home.hero.badge")}
            </div>

            <h1 className="font-display-lg text-m3-on-surface tracking-tight leading-[1.15] mb-6 font-extrabold">
              {t("home.hero.titleLead")}
              <span className="text-m3-primary underline decoration-m3-primary/25 decoration-wavy underline-offset-8">
                {t("home.hero.titleAccent")}
              </span>
            </h1>

            <p className="font-body-lg text-m3-on-surface-variant leading-relaxed mb-8 max-w-xl">
              {t("home.hero.subtitle")}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <a
                href="#assessment"
                className="inline-flex items-center gap-2 bg-m3-primary-container text-m3-on-primary font-bold px-7 py-3.5 rounded-full font-label-lg hover:brightness-95 transition-all"
              >
                {t("home.hero.ctaPrimary")}
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#courses"
                className="inline-flex items-center gap-2 bg-m3-surface-container-lowest text-m3-on-surface font-bold px-7 py-3.5 rounded-full font-label-lg border border-m3-surface-container hover:bg-m3-surface-container transition-all"
              >
                {t("home.hero.ctaSecondary")}
                <Compass className="w-[18px] h-[18px] text-m3-on-surface-variant" />
              </a>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center text-m3-tertiary">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-m3-tertiary text-m3-tertiary" />
                ))}
              </div>
              <p className="font-label-md text-m3-on-surface-variant">
                <strong className="text-m3-on-surface font-headline-sm">4.9/5</strong> {t("home.hero.rating")}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-m3-surface-container-low p-4 rounded-3xl border border-m3-surface-container">
              <div className="relative w-full rounded-2xl overflow-hidden bg-m3-surface-container-lowest border border-m3-surface-container">
                <img
                  alt="Linh vật Red Panda của PiEMind đang học trên máy tính bảng"
                  className="w-full h-auto object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnUfyOx8zHRsgIU7JVD1Gn-VCMIXnZgtAQH10V0Xeayvg8MzYHCf4-dVDlRpxiJqjfRvcGtwXMJs7IrdykM6vfzlXVEHnKIYdqmiUVlG7BKzbprdlJ3IdNNQKNmIS-0u80sfmooeBfSgAr9BJxNvExSvVF7dAaUvzf4cunj1uk_00eBK-Z3r8Zl9U0k0KwN-Exze1ZgqjqjEVE5Q3pIgWSNaZrHPI_CAJ8P7NW_P-aT9ncNe3FZs9w"
                />
              </div>
              <div className="mt-4 px-3 py-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-m3-on-surface block">{t("home.hero.mascotTitle")}</span>
                  <span className="text-xs text-m3-on-surface-variant">{t("home.hero.mascotSub")}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAFFD0] text-[#146a5f] text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t("home.hero.active")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
