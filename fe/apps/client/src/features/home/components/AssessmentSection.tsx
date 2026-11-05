import { BadgeCheck, CircleCheck, BookA, Megaphone, Ear, CircleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/use-i18n";
import type { TranslationKey } from "@/i18n/translations";

const skills: {
  label: TranslationKey;
  icon: LucideIcon;
  percent: number;
  desc: TranslationKey;
  highlight: boolean;
}[] = [
  { label: "home.assessment.grammar", icon: CircleCheck, percent: 72, desc: "home.assessment.grammarDesc", highlight: false },
  { label: "home.assessment.vocab", icon: BookA, percent: 81, desc: "home.assessment.vocabDesc", highlight: false },
  { label: "home.assessment.speaking", icon: Megaphone, percent: 54, desc: "home.assessment.speakingDesc", highlight: true },
  { label: "home.assessment.listening", icon: Ear, percent: 68, desc: "home.assessment.listeningDesc", highlight: false },
];

export const AssessmentSection = () => {
  const { t } = useI18n();
  return (
    <section className="w-full py-12 lg:py-20 bg-m3-surface border-b border-m3-surface-container" id="assessment">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-label-sm uppercase tracking-wider text-m3-primary font-bold">{t("home.assessment.eyebrow")}</span>
            <h2 className="font-headline-lg text-m3-on-surface mt-1">{t("home.assessment.title")}</h2>
            <p className="font-body-md text-m3-on-surface-variant mt-2 max-w-xl">{t("home.assessment.subtitle")}</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-m3-surface-container-low border border-m3-surface-container px-4 py-2 rounded-full self-start md:self-auto">
            <BadgeCheck className="w-[18px] h-[18px] text-m3-secondary" />
            <span className="font-label-md text-m3-on-surface">{t("home.assessment.cefrBadge")}</span>
          </div>
        </div>

        <div className="bg-m3-surface-container-low rounded-3xl p-6 sm:p-8 lg:p-10 border border-m3-surface-container">
          <div className="bg-m3-surface-container-lowest p-6 rounded-2xl border border-m3-surface-container flex flex-wrap items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-m3-secondary-fixed flex items-center justify-center font-headline-md text-[#146a5f] dark:text-m3-on-secondary-fixed font-extrabold text-lg">AM</div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-headline-sm text-m3-on-surface font-bold">Alex M.</h4>
                  <span className="font-label-sm px-2.5 py-0.5 rounded-full font-bold bg-[#EAFFD0] text-[#146a5f]">{t("home.assessment.complete")}</span>
                </div>
                <p className="font-body-sm text-m3-on-surface-variant mt-0.5">{t("home.assessment.profile")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-m3-surface-container-low border border-m3-surface-container px-4 py-2 rounded-xl">
              <span className="font-label-sm text-m3-on-surface-variant">{t("home.assessment.levelLabel")}</span>
              <span className="font-label-sm font-extrabold bg-m3-primary-container text-m3-on-primary px-3 py-1 rounded-lg">{t("home.assessment.levelValue")}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {skills.map((s) => {
              const Icon = s.icon;
              const tone = s.highlight ? "text-m3-primary" : "text-m3-secondary";
              return (
                <div
                  key={s.label}
                  className={`${s.highlight ? "border-2 border-m3-primary-container" : "border border-m3-surface-container"} bg-m3-surface-container-lowest p-5 rounded-2xl flex flex-col gap-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-label-sm font-bold flex items-center gap-1.5 ${tone}`}>
                      <Icon className="w-[18px] h-[18px]" /> {t(s.label)}
                    </span>
                    <span className={`font-headline-sm font-extrabold ${tone}`}>{s.percent}%</span>
                  </div>
                  <div className="w-full bg-m3-surface-container rounded-full h-2">
                    <div className={`${s.highlight ? "bg-m3-primary-container" : "bg-m3-secondary"} h-full rounded-full`} style={{ width: `${s.percent}%` }} />
                  </div>
                  <p className={`font-body-sm ${s.highlight ? "text-m3-on-surface font-medium" : "text-m3-on-surface-variant"}`}>{t(s.desc)}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-m3-surface-container-lowest rounded-2xl p-6 border border-m3-surface-container flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-m3-primary-container/10 text-m3-primary flex items-center justify-center shrink-0">
                <CircleAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="font-headline-sm text-m3-on-surface font-bold">{t("home.assessment.bannerTitle")}</h5>
                  <span className="font-label-sm px-2.5 py-0.5 rounded-full font-bold bg-[#EAFFD0] text-[#146a5f]">{t("home.assessment.bannerChip")}</span>
                </div>
                <p className="font-body-sm text-m3-on-surface-variant mt-1 max-w-2xl">{t("home.assessment.bannerDesc")}</p>
              </div>
            </div>
            <a href="#courses" className="w-full md:w-auto text-center font-label-sm text-m3-on-primary uppercase tracking-wider font-bold bg-m3-primary-container rounded-full px-6 py-3 hover:brightness-95 transition-all shrink-0">
              {t("home.assessment.bannerCta")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
