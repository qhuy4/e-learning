import { AlertTriangle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@fe/components/ui/badge";
import { useI18n } from "@/i18n/use-i18n";
import {
    SOURCE_KEYS,
    format,
    verificationBadgeClass,
    verificationLabelKey,
} from "../config/matching.config";
import type {
    InsufficientInstructor,
    RankedInstructor,
} from "../types/matching.type";

const getAvatarSrc = (name: string): string =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F38181&color=fff&bold=true`;

const fitBadgeClass = (fit: number): string => {
    if (fit >= 0.75)
        return "border border-secondary/50 bg-secondary/15 text-foreground";
    if (fit >= 0.4)
        return "border border-accent/60 bg-accent/20 text-foreground";
    return "border border-destructive/30 bg-destructive/5 text-destructive";
};

interface MatchingResultCardProps {
    result: RankedInstructor;
    rank: number;
}

/** Teacher card per skill.html §03 — explainable match, real API data. */
export function MatchingResultCard({ result, rank }: MatchingResultCardProps) {
    const { t } = useI18n();
    const { instructor } = result;
    const bookPath = `/instructors/${instructor.id}/book`;
    const topSkills = result.matchedSkills.slice(0, 3);
    const specialization =
        topSkills.length > 0
            ? topSkills.map((s) => s.name).join(" · ")
            : instructor.headline || t("match.card.instructor");
    const firstName = instructor.name.split(" ")[0];

    return (
        <article className="bg-card rounded-lg border border-border shadow-sm flex flex-col justify-between relative group hover:shadow-md transition-shadow">
            <div className="p-4 flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                            <img
                                alt={instructor.name}
                                src={getAvatarSrc(instructor.name)}
                                className="w-16 h-16 rounded-full object-cover border border-border"
                            />
                            <span className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-extrabold flex items-center justify-center border-2 border-card">
                                {rank}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base font-bold text-foreground leading-snug truncate">
                                {instructor.name}
                            </h3>
                            <span className="text-[13px] text-muted-foreground block truncate">
                                {instructor.headline ||
                                    t("match.card.instructor")}
                            </span>
                            <div className="flex items-center gap-1 text-[13px] text-foreground font-bold mt-0.5">
                                <Star
                                    size={14}
                                    className="text-accent-foreground fill-accent shrink-0"
                                />
                                <span>
                                    {instructor.avgRating != null
                                        ? Number(instructor.avgRating).toFixed(
                                              2,
                                          )
                                        : "—"}
                                </span>
                                <span className="font-normal text-muted-foreground text-[12px]">
                                    ({instructor.totalStudents}{" "}
                                    {t("match.card.reviews")})
                                </span>
                            </div>
                        </div>
                    </div>
                    <Badge
                        className={`rounded-full h-auto px-3 py-1.5 text-[13px] font-extrabold whitespace-nowrap ${fitBadgeClass(result.matchScore)}`}
                    >
                        {format(t("match.card.matchScore"), {
                            n: Math.round(result.matchScore * 100),
                        })}
                    </Badge>
                </div>

                {/* Specialization */}
                <div className="bg-muted px-3 py-1.5 rounded">
                    <span className="text-[12px] text-muted-foreground uppercase block font-semibold">
                        {t("match.card.specialization")}
                    </span>
                    <span className="text-[13px] font-bold text-foreground">
                        {specialization}
                    </span>
                </div>

                {/* Explainable AI box */}
                {topSkills.length > 0 && (
                    <div className="bg-secondary/35 p-3 rounded-lg">
                        <div>
                            <p className="text-[13px] text-foreground leading-relaxed">
                                <strong>
                                    {format(t("match.card.why"), {
                                        name: firstName,
                                    })}
                                </strong>{" "}
                                {format(t("match.card.whyReadable"), {
                                    skill: topSkills[0].name,
                                    score: Math.round(topSkills[0].score * 100),
                                })}
                            </p>
                        </div>
                    </div>
                )}

                {/* Ba chỉ số có nhãn người dùng, thay cho Fit/Coverage/Confidence thô. */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        [t("match.card.fitLabel"), result.matchScore],
                        [t("match.card.coverageLabel"), result.coverage],
                        [t("match.card.evidenceLabel"), result.confidenceAvg],
                    ].map(([label, value]) => (
                        <div
                            key={String(label)}
                            className="rounded-lg border border-border bg-muted p-2 text-center"
                        >
                            <strong className="block text-sm text-foreground">
                                {Math.round(Number(value) * 100)}%
                            </strong>
                            <span className="block text-xs leading-tight text-muted-foreground dark:text-slate-300">
                                {String(label)}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {instructor.teachesLevel != null && (
                        <Badge
                            variant="outline"
                            className={`rounded-full text-xs h-6 px-2 ${
                                instructor.teachesLevel
                                    ? "border-secondary/50 bg-secondary/15 text-foreground"
                                    : "border-border text-muted-foreground"
                            }`}
                        >
                            {instructor.teachesLevel
                                ? t("match.card.levelMatch")
                                : t("match.card.levelOff")}
                        </Badge>
                    )}
                </div>

                {/* Matched skills detail */}
                {topSkills.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                            {t("match.card.matchedSkills")}
                        </p>
                        <div className="flex flex-col gap-2">
                            {topSkills.map((skill) => {
                                const sourceKey = skill.sources[0]
                                    ? SOURCE_KEYS[skill.sources[0].type]
                                    : undefined;
                                return (
                                    <div
                                        key={skill.skillId}
                                        className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1"
                                    >
                                        <span className="text-xs font-semibold text-foreground">
                                            {skill.name}
                                        </span>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Badge
                                                variant="outline"
                                                className={`h-5 rounded-full px-1.5 text-[10px] ${verificationBadgeClass(skill.verifiedRatio)}`}
                                            >
                                                {t(verificationLabelKey(skill.verifiedRatio))}
                                            </Badge>
                                            <span className="text-xs font-bold text-foreground">
                                                {Math.round(skill.score * 100)}%
                                            </span>
                                        </div>
                                        <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                                            <span
                                                className="block h-full rounded-full bg-secondary"
                                                style={{
                                                    width: `${Math.round(skill.score * 100)}%`,
                                                }}
                                            />
                                        </span>
                                        <span className="text-xs text-muted-foreground dark:text-slate-300">
                                            {sourceKey ? t(sourceKey) : ""}
                                        </span>
                                    </div>
                                );
                            })}
                            {result.unknownSkills.length > 0 && (
                                <Badge
                                    variant="outline"
                                    className="rounded-full text-xs h-6 px-2 border-dashed text-muted-foreground dark:text-slate-300"
                                >
                                    <AlertTriangle size={10} />
                                    {result.unknownSkills[0].name} —{" "}
                                    {t("match.card.missing")}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                <p className="text-xs text-muted-foreground dark:text-slate-300 leading-snug">
                    {t("match.card.confNote")}
                </p>
            </div>

            {/* CTAs */}
            <div className="space-y-2 p-4 pt-0">
                <Link
                    to={bookPath}
                    className="w-full inline-flex items-center justify-center h-auto py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-full transition-colors cursor-pointer"
                >
                    {t("match.card.book")}
                </Link>
                <Link
                    to={bookPath}
                    className="w-full inline-flex items-center justify-center h-auto py-2.5 border border-border bg-background hover:bg-muted text-foreground font-semibold text-sm rounded-full transition-colors cursor-pointer"
                >
                    {t("match.card.viewProfile")}
                </Link>
            </div>
        </article>
    );
}

/** Instructor đủ điều kiện nhưng coverage = 0 → không xếp hạng. */
export function InsufficientCard({ item }: { item: InsufficientInstructor }) {
    const { t } = useI18n();
    return (
        <article className="rounded-lg border border-dashed border-border bg-muted p-5 flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <img
                    alt={item.instructor.name}
                    src={getAvatarSrc(item.instructor.name)}
                    className="w-10 h-10 rounded-full object-cover border border-border grayscale"
                />
                <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                        {item.instructor.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {item.instructor.headline || t("match.card.instructor")}
                    </p>
                </div>
            </div>
            <Badge
                variant="outline"
                className="w-fit rounded-full border-border text-muted-foreground dark:text-slate-300 font-bold"
            >
                <AlertTriangle size={11} />
                {t("match.card.insufficient")}
            </Badge>
            <p className="text-xs text-muted-foreground leading-snug">
                {t("match.card.insufficientDesc")}
            </p>
        </article>
    );
}
