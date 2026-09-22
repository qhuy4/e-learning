import { Clock } from "lucide-react";

const courses = [
  {
    title: "Speak with Confidence",
    level: "B1 → B2",
    lessons: 8,
    description:
      "Master natural transitions, everyday idioms, and voice intonation to break speaking hesitation in real conversation.",
    focus: "Speaking Focus",
    levelLabel: "Intermediate",
    duration: "3 weeks",
    featured: true,
    badge: "Top Pick for B1",
  },
  {
    title: "Grammar Foundations",
    level: "A2 → B1",
    lessons: 10,
    description:
      "Clarify conditional structures, passive voice, and complex prepositions with interactive visual sentence puzzles.",
    focus: "Grammar Focus",
    levelLabel: "Elementary+",
    duration: "4 weeks",
    featured: false,
  },
  {
    title: "Everyday English",
    level: "B1",
    lessons: 12,
    description:
      "Prepare for practical real-life scenarios: workplace banter, ordering at cafes, travel questions, and casual networking.",
    focus: "Vocab + Fluency",
    levelLabel: "Real-life",
    duration: "5 weeks",
    featured: false,
  },
];

export const RecommendedCourses = () => {
  return (
    <section className="w-full py-8 lg:py-16 bg-m3-surface" id="courses">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-label-sm uppercase tracking-wider text-m3-secondary bg-m3-secondary-container/60 px-3 py-1 rounded-full font-bold">
              Tailored Pathways
            </span>
            <h2 className="font-headline-lg text-m3-on-surface mt-2">
              A learning path made for you.
            </h2>
            <p className="font-body-md text-m3-on-surface-variant mt-1">
              Curated curriculum adapting dynamically to your placement results.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-m3-secondary-fixed/50 px-3 py-1.5 rounded-full self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-m3-secondary" />
            <span className="font-label-sm text-m3-on-surface font-bold">Synced with diagnostic</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((c) => (
            <div
              key={c.title}
              className={`bg-m3-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-6 relative ${
                c.featured ? "border-2 border-m3-primary-container" : "border border-m3-outline-variant/50"
              }`}
            >
              {c.badge && (
                <div className="absolute -top-3 right-6 bg-m3-primary-container text-m3-on-primary text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                  {c.badge}
                </div>
              )}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-label-sm font-bold text-m3-on-surface bg-m3-surface-container-high px-2.5 py-0.5 rounded-md">
                    Level: {c.level}
                  </span>
                  <span className="font-label-sm text-m3-on-surface-variant flex items-center gap-1">
                    <Clock className="w-[15px] h-[15px]" />
                    {c.lessons} lessons
                  </span>
                </div>
                <h3 className="font-headline-sm text-m3-on-surface font-bold">{c.title}</h3>
                <p className="font-body-sm text-m3-on-surface-variant leading-relaxed">
                  {c.description}
                </p>
                <div className="flex items-center gap-2 pt-1 font-label-sm text-m3-on-surface-variant">
                  <span className="font-bold text-m3-primary">{c.focus}</span>
                  <span>·</span>
                  <span>{c.levelLabel}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-m3-outline-variant/30">
                <div className="flex flex-col">
                  <span className="font-label-sm text-m3-on-surface-variant font-medium">Duration</span>
                  <span className="font-label-md font-bold text-m3-on-surface">{c.duration}</span>
                </div>
                <button
                  className={`font-label-md px-5 py-2.5 rounded-full transition-all ${
                    c.featured
                      ? "bg-m3-primary-container text-m3-on-primary hover:brightness-110 shadow-sm"
                      : "bg-m3-surface-container text-m3-on-surface hover:bg-m3-primary-container hover:text-m3-on-primary"
                  }`}
                >
                  {c.featured ? "Start Course" : "Explore"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
