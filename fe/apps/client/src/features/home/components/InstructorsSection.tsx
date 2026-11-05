import { Link } from "react-router";
import { Star, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n/use-i18n";
import { useInstructors } from "@/features/instructors/hooks/use-instructors";

export const InstructorsSection = () => {
  const { t } = useI18n();
  const { data, isLoading } = useInstructors({ page: 1, limit: 3 });
  const instructors = data?.data.slice(0, 3) ?? [];

  if (!isLoading && instructors.length === 0) return null;

  return (
    <section className="w-full py-12 lg:py-20 bg-m3-surface-container-low border-b border-m3-surface-container" id="instructors">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-3">
          <span className="font-label-sm uppercase tracking-wider bg-[#EAFFD0] text-[#146a5f] px-3 py-1 rounded-full font-bold">{t("home.instructors.pill")}</span>
          <h2 className="font-headline-lg text-m3-on-surface">{t("home.instructors.title")}</h2>
          <p className="font-body-md text-m3-on-surface-variant">{t("home.instructors.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading
            ? [0, 1, 2].map((i) => (
                <div key={i} className="h-72 rounded-3xl border border-m3-surface-container bg-m3-surface-container-lowest animate-pulse" />
              ))
            : instructors.map((m) => (
                <div key={m.id} className="bg-m3-surface-container-lowest rounded-3xl p-6 border border-m3-surface-container flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      {m.avatarUrl ? (
                        <img className="w-16 h-16 rounded-2xl object-cover border border-m3-surface-container shrink-0" alt={m.name} src={m.avatarUrl} />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-m3-secondary-fixed border border-m3-surface-container shrink-0 flex items-center justify-center font-headline-sm font-bold text-[#146a5f] dark:text-m3-on-secondary-fixed">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-headline-sm text-m3-on-surface font-bold truncate">{m.name}</h4>
                        {m.headline && <p className="font-label-sm text-m3-secondary font-bold truncate">{m.headline}</p>}
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-m3-tertiary text-m3-tertiary" />
                          <span className="font-label-sm font-bold text-m3-on-surface">{m.avgRating}</span>
                          <span className="font-label-sm text-m3-on-surface-variant">({m.totalStudents} {t("home.instructors.students")})</span>
                        </div>
                      </div>
                    </div>
                    {m.certificateTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {m.certificateTags.slice(0, 3).map((tag) => (
                          <span key={tag} className="font-label-sm px-2.5 py-1 rounded-full bg-m3-surface-container text-m3-on-surface-variant">{tag}</span>
                        ))}
                      </div>
                    )}
                    {m.bio && <p className="font-body-sm text-m3-on-surface-variant leading-relaxed mb-6 line-clamp-3">{m.bio}</p>}
                  </div>
                  <Link
                    to={`/instructors/${m.id}/book`}
                    className="w-full py-2.5 px-4 rounded-xl border border-m3-surface-container text-xs font-bold text-m3-on-surface hover:bg-m3-surface-container transition-colors flex items-center justify-center gap-1"
                  >
                    {t("home.instructors.viewProfile")}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};
