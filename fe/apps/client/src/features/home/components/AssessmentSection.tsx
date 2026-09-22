import { BadgeCheck, CircleCheck, BookA, Megaphone, Ear, Mic } from "lucide-react";

const skills = [
  { label: "Grammar", icon: CircleCheck, color: "text-m3-tertiary", percent: 72, barColor: "bg-m3-tertiary-fixed", desc: "Solid structural baseline with complex tense clarity.", highlight: false },
  { label: "Vocabulary", icon: BookA, color: "text-m3-secondary", percent: 81, barColor: "bg-m3-secondary-fixed-dim", desc: "Strong functional lexicon for daily & work contexts.", highlight: false },
  { label: "Speaking", icon: Megaphone, color: "text-m3-primary", percent: 54, barColor: "bg-m3-primary-container", desc: "Hesitation pauses on spontaneous conversation.", highlight: true },
  { label: "Listening", icon: Ear, color: "text-m3-secondary", percent: 68, barColor: "bg-m3-secondary-container", desc: "Understands main ideas in native-speed audio clips.", highlight: false },
];

export const AssessmentSection = () => {
  return (
    <section className="w-full py-8 lg:py-16 bg-m3-surface" id="assessment">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-label-sm uppercase tracking-wider text-m3-primary font-bold">Precision Diagnostic</span>
            <h2 className="font-headline-lg text-m3-on-surface mt-1">Your English, understood.</h2>
            <p className="font-body-md text-m3-on-surface-variant mt-1">See the exact diagnostic breakdown our AI engine creates after a 10-minute diagnostic.</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-m3-surface-container px-4 py-2 rounded-full self-start md:self-auto">
            <BadgeCheck className="w-[18px] h-[18px] text-m3-secondary" />
            <span className="font-label-md text-m3-on-surface">CEFR Certified Analysis</span>
          </div>
        </div>

        <div className="bg-m3-surface-container-lowest rounded-2xl p-6 lg:p-10 shadow-lg flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-m3-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-m3-surface-container gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-m3-secondary-fixed flex items-center justify-center font-headline-md text-m3-on-secondary-fixed font-bold">AM</div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-headline-sm text-m3-on-surface font-bold">Alex M.</h4>
                  <span className="font-label-sm px-2.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: "rgb(234, 255, 208)", color: "rgb(20, 106, 95)" }}>Diagnostic Completed</span>
                </div>
                <p className="font-body-sm text-m3-on-surface-variant">Profile ID: #PIE-8821 • Evaluated by Red Panda AI Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-m3-surface-container-low px-5 py-2.5 rounded-2xl">
              <span className="font-label-md text-m3-on-surface-variant">Current Level:</span>
              <span className="font-headline-sm font-bold bg-m3-primary-container text-m3-on-primary px-3 py-1 rounded-xl">B1 Intermediate</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`${s.highlight ? "bg-m3-primary-fixed/30 relative shadow-inner" : "bg-m3-surface-container-low"} p-5 rounded-2xl flex flex-col gap-3`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-label-lg font-semibold flex items-center gap-1.5 ${s.color}`}>
                      <Icon className="w-[18px] h-[18px]" /> {s.label}
                    </span>
                    <span className={`font-headline-sm font-bold ${s.color}`}>{s.percent}%</span>
                  </div>
                  <div className="w-full bg-m3-surface-container-highest rounded-full h-3">
                    <div className={`${s.barColor} h-full rounded-full`} style={{ width: `${s.percent}%` }} />
                  </div>
                  <p className={`font-body-sm ${s.highlight ? "text-m3-on-surface font-medium" : "text-m3-on-surface-variant"}`}>{s.desc}</p>
                </div>
              );
            })}
          </div>

          <div
            className="rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border"
            style={{ backgroundColor: "rgba(243, 129, 129, 0.1)", borderColor: "rgba(243, 129, 129, 0.3)" }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md" style={{ backgroundColor: "#F38181" }}>
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-m3-on-surface font-bold">Your main area to improve: Speaking</span>
                  <span className="font-label-sm px-2.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: "#ffdad8", color: "#9e3f42" }}>Primary Target</span>
                </div>
                <p className="font-body-md text-m3-on-surface-variant mt-1 max-w-2xl">Based on your assessment, PiEMind recommends focusing on speaking confidence and conversation practice with native-level coaches.</p>
              </div>
            </div>
            <a href="#courses" className="w-full md:w-auto font-label-lg text-white rounded-full px-8 py-3.5 shadow-[0_4px_0_#9e3f42] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all text-center whitespace-nowrap" style={{ backgroundColor: "#F38181" }}>
              See My Learning Path →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
