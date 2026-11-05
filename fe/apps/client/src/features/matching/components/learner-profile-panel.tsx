import { Search } from "lucide-react";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { Checkbox } from "@fe/components/ui/checkbox";
import { Skeleton } from "@fe/components/ui/skeleton";
import { useI18n } from "@/i18n/use-i18n";
import {
    bandLabel,
    format,
    SKILL_CODE_KEYS,
    SKILL_SOURCE_KEYS,
    SKILL_STATUS_KEYS,
    skillStatusBadgeClass,
} from "@/features/matching/config/matching.config";
import { ErrorBanner } from "@/features/matching/components/error-banner";
import type { LearnerProfile } from "@/features/matching/types/matching.type";

/**
 * Bước 3 — hồ sơ học viên hợp nhất: level (writing > quiz), tự đánh giá vs
 * đo được, và trạng thái trung thực từng kỹ năng (assessed / insufficient /
 * not_assessed). Không bịa điểm: mọi badge đều từ dữ liệu backend trả về.
 */
export function LearnerProfilePanel({
    profile,
    loading,
    errorMessage,
    onRetry,
    onFind,
    finding,
    canFind,
    requireLevelMatch,
    onRequireLevelMatchChange,
}: {
    profile: LearnerProfile | null;
    loading: boolean;
    errorMessage?: string;
    onRetry: () => void;
    onFind: () => void;
    finding: boolean;
    canFind: boolean;
    requireLevelMatch: boolean;
    onRequireLevelMatchChange: (value: boolean) => void;
}) {
    const { t } = useI18n();

    const skillName = (code: string): string =>
        SKILL_CODE_KEYS[code] ? t(SKILL_CODE_KEYS[code]) : code;

    if (loading && !profile) {
        return (
            <div className="flex flex-col gap-3">
                <Skeleton className="h-16 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }, (_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (errorMessage && !profile) {
        return <ErrorBanner message={errorMessage} onRetry={onRetry} />;
    }

    if (!profile) return null;

    const sourceLabel = profile.levelSource
        ? t(
              profile.levelSource === "quiz"
                  ? SKILL_SOURCE_KEYS.quiz
                  : SKILL_SOURCE_KEYS.writing,
          )
        : null;

    const selfBand = profile.selfAssessment?.band ?? null;
    const selfLabel = selfBand
        ? selfBand === "auto"
            ? t("match.self.auto")
            : bandLabel(selfBand, t)
        : null;

    const readableSkillNote = (skill: LearnerProfile["skills"][number]) =>
        skill.code === "vocabulary" && skill.status === "assessed" && skill.band
            ? format(t("match.profile.vocabSummary"), {
                  band: bandLabel(skill.band, t),
              })
            : skill.note;

    return (
        <div className="flex flex-col gap-5">
            {/* Level + tự đánh giá vs đo được */}
            <div className="rounded-lg border border-border bg-card px-5 py-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        {t("match.profile.level")}
                    </span>
                    {profile.levelBand ? (
                        <Badge
                            variant="outline"
                            className="rounded-full border-primary/40 bg-primary/10 text-foreground font-bold"
                        >
                            {bandLabel(profile.levelBand, t)}
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="rounded-full text-muted-foreground dark:text-slate-300"
                        >
                            {t("match.profile.levelUnknown")}
                        </Badge>
                    )}
                    {sourceLabel && (
                        <span className="text-xs text-muted-foreground dark:text-slate-300">
                            {sourceLabel}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground dark:text-slate-300">
                    {selfLabel ? (
                        <>
                            <span>
                                {format(t("match.profile.selfSaid"), {
                                    band: selfLabel,
                                })}
                            </span>
                            {profile.levelBand && (
                                <span>
                                    {selfBand === profile.levelBand
                                        ? t("match.profile.selfMatch")
                                        : format(t("match.profile.selfDiff"), {
                                              band: bandLabel(
                                                  profile.levelBand,
                                                  t,
                                              ),
                                          })}
                                </span>
                            )}
                        </>
                    ) : (
                        <span>{t("match.profile.selfNone")}</span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground dark:text-slate-300">
                    {profile.quiz && (
                        <span>
                            {format(t("match.profile.quizStat"), {
                                n: profile.quiz.total,
                                m: profile.quiz.rawScore,
                            })}
                        </span>
                    )}
                    {profile.writing && (
                        <span>
                            {format(t("match.profile.writingStat"), {
                                n: profile.writing.wordCount ?? 0,
                            })}
                        </span>
                    )}
                </div>
            </div>

            {/* Trạng thái từng kỹ năng */}
            <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                    {t("match.profile.skillsTitle")}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {profile.skills.map((skill) => (
                        <div
                            key={skill.code}
                            className="rounded-lg border border-border bg-card px-4 py-3 flex flex-col gap-2"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-sm text-foreground">
                                    {skillName(skill.code)}
                                </span>
                                <Badge
                                    variant="outline"
                                    className={`rounded-full text-xs h-6 px-2 ${skillStatusBadgeClass(skill.status)}`}
                                >
                                    {t(SKILL_STATUS_KEYS[skill.status])}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                                {skill.band && (
                                    <Badge
                                        variant="outline"
                                        className="rounded-full text-xs h-6 px-2 border-primary/40 text-primary"
                                    >
                                        {bandLabel(skill.band, t)}
                                    </Badge>
                                )}
                                {skill.source && (
                                    <span className="text-xs text-muted-foreground dark:text-slate-300">
                                        {t(SKILL_SOURCE_KEYS[skill.source])}
                                    </span>
                                )}
                                {skill.qualityScore != null && (
                                    <span className="text-xs text-muted-foreground dark:text-slate-300">
                                        {format(t("match.profile.quality"), {
                                            n: skill.qualityScore,
                                        })}
                                    </span>
                                )}
                            </div>

                            <p className="text-[12px] text-muted-foreground dark:text-slate-300 leading-relaxed">
                                {readableSkillNote(skill)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA tìm giảng viên */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <Button
                        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer"
                        disabled={!canFind || finding}
                        onClick={onFind}
                    >
                        <Search size={16} />
                        {finding
                            ? t("match.profile.finding")
                            : t("match.profile.find")}
                    </Button>
                    <label
                        htmlFor="require-level-profile"
                        className="flex items-center gap-2 text-xs text-muted-foreground dark:text-slate-300 font-medium cursor-pointer"
                    >
                        <Checkbox
                            id="require-level-profile"
                            checked={requireLevelMatch}
                            onCheckedChange={(checked) =>
                                onRequireLevelMatchChange(checked === true)
                            }
                        />
                        {t("match.level.strict")} ({profile.levelBand ?? "—"})
                    </label>
                </div>
                {!canFind && (
                    <p className="text-sm text-muted-foreground">
                        {t("match.profile.noEvidence")}
                    </p>
                )}
            </div>
        </div>
    );
}
