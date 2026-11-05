import { Ear, Lightbulb, GraduationCap, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/use-i18n";
import type { TranslationKey } from "@/i18n/translations";

const steps: {
  number: string;
  title: TranslationKey;
  description: TranslationKey;
  footer: TranslationKey;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  footerColor: string;
}[] = [
  {
    number: "01",
    title: "home.how.step1.title",
    description: "home.how.step1.desc",
    footer: "home.how.step1.footer",
    icon: Ear,
    iconBg: "bg-[#EAFFD0]",
    iconColor: "text-[#146a5f]",
    footerColor: "text-m3-primary",
  },
  {
    number: "02",
    title: "home.how.step2.title",
    description: "home.how.step2.desc",
    footer: "home.how.step2.footer",
    icon: Lightbulb,
    iconBg: "bg-m3-secondary-container/50",
    iconColor: "text-m3-secondary",
    footerColor: "text-m3-secondary",
  },
  {
    number: "03",
    title: "home.how.step3.title",
    description: "home.how.step3.desc",
    footer: "home.how.step3.footer",
    icon: GraduationCap,
    iconBg: "bg-[#EAFFD0]",
    iconColor: "text-[#146a5f]",
    footerColor: "text-m3-secondary",
  },
];

export const HowItWorksSection = () => {
  const { t } = useI18n();
  return (
    <section className="w-full py-12 lg:py-20 bg-m3-surface-container-low border-b border-m3-surface-container" id="how-it-works">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-3">
          <span className="font-label-sm uppercase tracking-wider bg-[#EAFFD0] text-[#146a5f] px-3 py-1 rounded-full font-bold">
            {t("home.how.pill")}
          </span>
          <h2 className="font-headline-lg text-m3-on-surface">{t("home.how.title")}</h2>
          <p className="font-body-md text-m3-on-surface-variant">{t("home.how.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.number}
                className="bg-m3-surface-container-lowest rounded-3xl p-8 border border-m3-surface-container flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-headline-md text-3xl font-extrabold text-m3-surface-container-highest select-none">
                      {s.number}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl ${s.iconBg} ${s.iconColor} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="font-headline-sm text-m3-on-surface font-bold mb-2">{t(s.title)}</h3>
                  <p className="font-body-sm text-m3-on-surface-variant leading-relaxed">{t(s.description)}</p>
                </div>
                <div className={`mt-8 pt-4 border-t border-m3-surface-container flex items-center text-xs font-bold ${s.footerColor}`}>
                  <span>{t(s.footer)}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
