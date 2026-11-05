import { ArrowRight, CircleCheck, CreditCard, Star } from "lucide-react";
import { useI18n } from "@/i18n/use-i18n";

export const CTASection = () => {
    const { t } = useI18n();
    return (
        <section className="w-full py-12 lg:py-20 bg-m3-surface-container-low">
            <div className="max-w-[960px] mx-auto px-6 lg:px-8">
                <div className="bg-m3-surface-container-lowest rounded-3xl p-10 sm:p-14 border border-m3-surface-container text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAFFD0] text-[#146a5f] text-xs font-bold mb-6">
                        {t("home.cta.pill")}
                    </div>

                    <h2 className="font-display-lg text-m3-on-surface font-extrabold tracking-tight mb-4 max-w-xl">
                        {t("home.cta.title")}
                    </h2>
                    <p className="font-body-lg text-m3-on-surface-variant max-w-lg mb-8 leading-relaxed">
                        {t("home.cta.subtitle")}
                    </p>

                    <a
                        href="#assessment"
                        className="inline-flex items-center gap-2 bg-m3-primary-container text-m3-on-primary font-bold font-label-lg px-8 py-4 rounded-full hover:brightness-95 transition-all"
                    >
                        {t("home.cta.button")}
                        <ArrowRight className="w-5 h-5" />
                    </a>

                    <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-8 border-t border-m3-surface-container text-xs font-semibold text-m3-on-surface-variant">
                        <span className="flex items-center gap-1.5">
                            <CircleCheck className="w-4 h-4 text-m3-secondary" />
                            {t("home.cta.perk1")}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-m3-secondary" />
                            {t("home.cta.perk2")}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-m3-secondary" />
                            {t("home.cta.perk3")}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};
