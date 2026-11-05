import { Link } from "react-router";
import { Star } from "lucide-react";
import { useI18n } from "@/i18n/use-i18n";
import type { TranslationKey } from "@/i18n/translations";
import { useCatalogCourses } from "@/features/courses/hooks/use-course-catalog";

const levelKeys: Record<number, TranslationKey> = {
  1: "home.courses.level1",
  2: "home.courses.level2",
  3: "home.courses.level3",
};

const formatPrice = (price: number, freeLabel: string) => {
  if (price === 0) return freeLabel;
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
};

export const RecommendedCourses = () => {
  const { t } = useI18n();
  const { data, isLoading } = useCatalogCourses({ page: 1, limit: 3 });
  const courses = data?.data ?? [];

  if (!isLoading && courses.length === 0) return null;

  return (
    <section className="w-full py-12 lg:py-20 bg-m3-surface border-b border-m3-surface-container" id="courses">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-label-sm uppercase tracking-wider font-bold text-m3-secondary">{t("home.courses.pill")}</span>
            <h2 className="font-headline-lg text-m3-on-surface mt-1">{t("home.courses.title")}</h2>
            <p className="font-body-md text-m3-on-surface-variant mt-2">{t("home.courses.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="font-label-sm text-m3-on-surface-variant font-semibold">{t("home.courses.synced")}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-m3-secondary" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading
            ? [0, 1, 2].map((i) => (
                <div key={i} className="h-72 rounded-3xl border border-m3-surface-container bg-m3-surface-container-lowest animate-pulse" />
              ))
            : courses.map((c, index) => {
                const featured = index === 0;
                return (
                  <div
                    key={c.id}
                    className={`${featured ? "border-2 border-m3-primary-container" : "border border-m3-surface-container"} bg-m3-surface-container-lowest rounded-3xl p-7 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                        {featured ? (
                          <span className="text-xs font-extrabold text-m3-on-primary bg-m3-primary-container px-3 py-1 rounded-full uppercase tracking-wide">
                            {t("home.courses.badge")}
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EAFFD0] text-[#146a5f]">
                            {t("home.courses.levelPrefix")}{t(levelKeys[c.level] ?? "home.courses.level1")}
                          </span>
                        )}
                        <span className="text-xs text-m3-on-surface-variant font-medium flex items-center gap-1">
                          <Star className="w-4 h-4 fill-m3-tertiary text-m3-tertiary" />
                          <strong className="text-m3-on-surface">{c.avgRating}</strong>
                          ({c.reviewCount} {t("home.instructors.reviews")})
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-m3-on-surface font-bold mb-3 line-clamp-2">{c.title}</h3>
                      {c.instructorName && (
                        <div className="flex items-center gap-2">
                          {c.instructorAvatar ? (
                            <img className="w-7 h-7 rounded-full object-cover border border-m3-surface-container" alt={c.instructorName} src={c.instructorAvatar} />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-m3-secondary-fixed border border-m3-surface-container flex items-center justify-center text-xs font-bold text-[#146a5f] dark:text-m3-on-secondary-fixed">
                              {c.instructorName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-label-sm text-m3-on-surface-variant">{c.instructorName}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-8 pt-4 border-t border-m3-surface-container flex items-center justify-between gap-3">
                      <span className={`font-label-sm font-extrabold ${c.price === 0 ? "text-m3-secondary" : "text-m3-on-surface"}`}>
                        {formatPrice(c.price, t("home.courses.free"))}
                      </span>
                      <Link
                        to={`/courses/${c.slug}`}
                        className={`${featured ? "text-m3-on-primary bg-m3-primary-container hover:brightness-95" : "text-m3-on-surface bg-m3-surface-container-lowest border border-m3-surface-container hover:bg-m3-surface-container"} text-xs font-bold px-5 py-2.5 rounded-full transition-colors`}
                      >
                        {featured ? t("home.courses.startCourse") : t("home.courses.explore")}
                      </Link>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
};
