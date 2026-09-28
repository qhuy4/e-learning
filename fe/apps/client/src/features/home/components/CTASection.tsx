import { ArrowRight, CircleCheck, CreditCard, Star } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="w-full py-8 lg:py-16 bg-m3-surface relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-m3-primary-fixed/40 via-m3-surface-container-low to-m3-secondary-fixed/40 rounded-2xl p-8 lg:p-16 text-center flex flex-col items-center gap-6 shadow-lg overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-m3-primary-container/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-m3-tertiary-fixed/40 rounded-full blur-2xl" />

          <div className="inline-flex items-center gap-2 bg-m3-surface-container-lowest px-4 py-2 rounded-full shadow-sm">
            <span className="text-2xl">🐾</span>
            <span className="font-label-md text-m3-on-surface font-bold">Your Companion is Waiting</span>
          </div>

          <div className="max-w-2xl flex flex-col gap-2">
            <h2 className="font-display-lg text-m3-on-surface font-bold tracking-tight">Ready to learn smarter?</h2>
            <p className="font-body-lg text-m3-on-surface-variant">Start by understanding your English. Join thousands improving their fluency with zero guesswork.</p>
          </div>

          <a href="#assessment" className="font-label-lg bg-m3-primary-container text-m3-on-primary rounded-full px-10 py-4 shadow-[0_6px_0_#9e3f42] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all flex items-center gap-2 text-lg">
            Take Your Placement Test
            <ArrowRight className="w-[22px] h-[22px]" />
          </a>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-m3-on-surface-variant">
            <div className="flex items-center gap-2 font-label-md">
              <CircleCheck className="w-5 h-5 text-m3-secondary" />
              Free 10-Minute Assessment
            </div>
            <div className="flex items-center gap-2 font-label-md">
              <CreditCard className="w-5 h-5 text-m3-secondary" />
              No Credit Card Required
            </div>
            <div className="flex items-center gap-2 font-label-md">
              <Star className="w-5 h-5 text-m3-secondary" />
              Instant CEFR Level
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
