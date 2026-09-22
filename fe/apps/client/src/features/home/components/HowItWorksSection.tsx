import { Ear, Lightbulb, GraduationCap, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const hoverBorderClass: Record<string, string> = {
  primary: "hover:border-m3-primary-container",
  secondary: "hover:border-m3-secondary-container",
  tertiary: "hover:border-m3-tertiary-container",
};

const steps: {
  number: string;
  label: string;
  title: string;
  description: string;
  footer: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  hoverTextClass: string;
  numberColor: string;
  type: "primary" | "secondary" | "tertiary";
}[] = [
  {
    number: "01",
    label: "Step 01 • Diagnostic",
    title: "10-Min AI Diagnostic",
    description:
      "Engage in an adaptive interactive conversation. The AI tests pronunciation, grammar breadth, response cadence, and idiom retrieval.",
    footer: "Voice & Vocabulary Profiling",
    icon: Ear,
    iconBg: "bg-gradient-to-tr from-rose-50 to-orange-50 border border-rose-200/60",
    iconColor: "text-m3-primary",
    hoverTextClass: "card-hover-text-primary",
    numberColor: "number-hover-primary",
    type: "primary",
  },
  {
    number: "02",
    label: "Step 02 • Analysis",
    title: "In-Depth Gap Analysis",
    description:
      "Uncover the exact structural patterns and phonemes causing hesitation, accurately correlated to official CEFR descriptors.",
    footer: "CEFR Matrix & Acoustic Map",
    icon: Lightbulb,
    iconBg: "bg-gradient-to-tr from-teal-50 to-emerald-50 border border-teal-200/60",
    iconColor: "text-m3-secondary",
    hoverTextClass: "card-hover-text-secondary",
    numberColor: "number-hover-secondary",
    type: "secondary",
  },
  {
    number: "03",
    label: "Step 03 • Action",
    title: "Targeted Mentorship",
    description:
      "Receive a 100% custom-curated pathway and 1-on-1 sessions with native educators specifically calibrated for your growth spots.",
    footer: "Zero Wasted Time",
    icon: GraduationCap,
    iconBg: "bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-200/60",
    iconColor: "text-m3-tertiary",
    hoverTextClass: "card-hover-text-tertiary",
    numberColor: "number-hover-tertiary",
    type: "tertiary",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="w-full py-8 lg:py-16 bg-m3-surface-container-low" id="how-it-works">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center gap-2.5">
          <span className="font-label-sm uppercase tracking-wider text-m3-primary bg-m3-primary-fixed/50 px-3.5 py-1 rounded-full font-bold">
            Pedagogical Framework
          </span>
          <h2 className="font-headline-lg text-m3-on-surface">
            A smarter, data-driven way to master English.
          </h2>
          <p className="font-body-md text-m3-on-surface-variant">
            Traditional apps rely on repetitive flashcards. PiEMind analyzes your neural speech
            patterns and pairs you with tailored native lessons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.number}
                className={`group relative rounded-3xl p-8 border border-m3-outline-variant/50 shadow-sm card-hover-m3 flex flex-col justify-between gap-6 overflow-hidden ${hoverBorderClass[s.type]}`}
              >
                <div
                  className={`absolute -top-3 -right-2 text-7xl font-black text-m3-surface-container-highest select-none ${s.numberColor}`}
                >
                  {s.number}
                </div>
                <div className="relative z-10 flex flex-col gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl ${s.iconBg} flex items-center justify-center ${s.iconColor} shadow-sm`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`font-label-sm ${s.iconColor} uppercase tracking-wider font-bold`}>
                      {s.label}
                    </span>
                    <h3 className="font-headline-sm text-m3-on-surface font-bold mt-1 mb-2">
                      {s.title}
                    </h3>
                    <p className="font-body-sm text-m3-on-surface-variant leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>
                <div className="relative z-10 pt-4 border-t border-m3-outline-variant/30 flex items-center justify-between font-label-sm font-bold">
                  <span className={`text-m3-on-surface-variant ${s.hoverTextClass}`}>
                    {s.footer}
                  </span>
                  <ArrowRight className="w-4 h-4 text-m3-outline card-hover-arrow" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
