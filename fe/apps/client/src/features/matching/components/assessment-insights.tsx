import { BadgeCheck } from "lucide-react";
import { Badge } from "@fe/components/ui/badge";
import { useI18n } from "@/i18n/use-i18n";
import {
    BAND_KEYS,
    CORRECTION_TYPE_KEYS,
    GRAMMAR_QUALITY_THRESHOLDS,
    RELIABILITY_KEYS,
    SKILL_CODE_KEYS,
    format,
    grammarQualityBadgeClass,
} from "../config/matching.config";
import type { WritingAssessment } from "../types/matching.type";

const FOCUS_TAG_CLASS = [
    "bg-primary/10 text-foreground border border-primary/40",
    "bg-secondary/15 text-foreground border border-secondary/50",
    "bg-accent/20 text-foreground border border-accent/60",
];
const FOCUS_BAR_CLASS = ["bg-primary", "bg-secondary", "bg-accent-foreground"];

function ScoreBar({
    label,
    value,
    barClass,
    rightClass,
    badge,
    badgeClass,
}: {
    label: string;
    value: string;
    barClass: string;
    rightClass: string;
    badge?: string;
    /** Badge có nghĩa phải có màu — dùng grammarQualityBadgeClass/… */
    badgeClass?: string;
}) {
    const pct = Math.max(0, Math.min(100, Number.parseFloat(value) || 0));
    return (
        <div>
            <div className="flex justify-between items-center gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-bold text-foreground">
                        {label}
                    </span>
                    {badge && (
                        <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${badgeClass ?? "bg-primary/15 text-foreground"}`}
                        >
                            {badge}
                        </span>
                    )}
                </div>
                <span className={`text-sm font-bold shrink-0 ${rightClass}`}>
                    {value}
                </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${barClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function NotAssessedRow({ label, note }: { label: string; note: string }) {
    return (
        <div className="bg-muted p-2.5 rounded">
            <div className="mb-0.5">
                <span className="text-[13px] font-semibold text-foreground">
                    {label}
                </span>
            </div>
            <p className="text-[12px] text-muted-foreground leading-tight">
                {note}
            </p>
        </div>
    );
}

/** Section 02: scorecard + AI insight + focus tags — real WritingAssessment data. */
export function AssessmentInsights({
    assessment,
}: {
    assessment: WritingAssessment;
}) {
    const { t } = useI18n();

    const skillName = (code: string): string =>
        SKILL_CODE_KEYS[code] ? t(SKILL_CODE_KEYS[code]) : code;
    const bandText = (band: string): string =>
        BAND_KEYS[band] ? t(BAND_KEYS[band]) : band;

    const coveragePct =
        assessment.cefr.coverage != null
            ? Math.round(assessment.cefr.coverage * 100)
            : null;
    // --- Grammar: quality (điểm) tách khỏi density (mật độ) -------------------
    const qualityScore = assessment.grammar.qualityScore;
    const errorSignal = assessment.grammar.errorSignalPer100w;
    const changes = assessment.grammar.changes ?? [];
    /** Chỉ accepted mới tính vào điểm — rejected nằm trong list nhưng không tính. */
    const scoredChanges = changes.filter((c) => c.accepted);

    /** Badge theo CHẤT LƯỢNG grammar — không suy ra từ reliability/confidence. */
    const qualityBadgeLabel =
        qualityScore == null
            ? undefined
            : qualityScore >= GRAMMAR_QUALITY_THRESHOLDS.good
              ? t("match.s2.qualityGood")
              : qualityScore >= GRAMMAR_QUALITY_THRESHOLDS.fair
                ? t("match.s2.qualityFair")
                : t("match.s2.needWork");

    const correctionTypeLabel = (type: string): string =>
        CORRECTION_TYPE_KEYS[type] ? t(CORRECTION_TYPE_KEYS[type]) : type;
    const sortedFocus = [...assessment.focusTargets].sort(
        (a, b) => b.weightPct - a.weightPct,
    );
    const focusReason = (code: string): string => {
        if (code === "vocabulary")
            return format(t("match.s2.focusReason.vocabulary"), {
                band: assessment.cefr.band
                    ? bandText(assessment.cefr.band)
                    : t("match.s2.bandUnknown"),
            });
        if (code === "grammar") {
            const accepted = assessment.grammar.acceptedChanges ?? 0;
            return accepted > 0
                ? format(t("match.s2.focusReason.grammar"), { n: accepted })
                : t("match.s2.focusReason.grammarClean");
        }
        return t("match.s2.focusReason.writing");
    };
    return (
        <section className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                        {t("match.s2.area")}
                    </span>
                    <h2 className="text-[22px] md:text-[26px] font-bold text-foreground">
                        {t("match.s2.title")}
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: scorecard */}
                <div className="lg:col-span-5 bg-card p-6 rounded-lg border border-border shadow-sm flex flex-col justify-between gap-4">
                    <div>
                        <div className="flex items-center justify-between mb-4 gap-2">
                            <span className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold">
                                {t("match.s2.cefrLabel")}
                            </span>
                            <div className="px-3 py-1 border border-secondary/50 bg-secondary/15 text-foreground rounded-full text-sm font-extrabold flex items-center gap-1.5">
                                <BadgeCheck size={16} />
                                <span>
                                    {assessment.cefr.band
                                        ? bandText(assessment.cefr.band)
                                        : t("match.s2.bandUnknown")}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {coveragePct != null && (
                                <ScoreBar
                                    label={t("match.s2.vocab")}
                                    value={`${coveragePct}/100`}
                                    barClass="bg-secondary"
                                    rightClass="text-foreground"
                                />
                            )}

                            {/* Grammar Quality Score — heuristic 0–100, KHÔNG phải accuracy
                  đã hiệu chỉnh. null = thiếu bằng chứng → không hiển thị điểm. */}
                            {qualityScore != null ? (
                                <ScoreBar
                                    label={t("match.s2.grammarQuality")}
                                    value={`${qualityScore}/100`}
                                    barClass="bg-primary"
                                    rightClass="text-primary"
                                    badge={qualityBadgeLabel}
                                    badgeClass={grammarQualityBadgeClass(
                                        qualityScore,
                                    )}
                                />
                            ) : (
                                <NotAssessedRow
                                    label={t("match.s2.grammarQuality")}
                                    note={t("match.s2.grammarNoEvidence")}
                                />
                            )}

                            {/* Error density — đại lượng RIÊNG (mật độ), không phải điểm */}
                            {errorSignal != null && (
                                <ScoreBar
                                    label={t("match.s2.grammar")}
                                    value={`${errorSignal}/100w`}
                                    barClass="bg-muted-foreground/40"
                                    rightClass="text-muted-foreground"
                                />
                            )}
                        </div>

                        {/* Tuyên bố heuristic — điểm chất lượng không phải accuracy đã hiệu chỉnh */}
                        {qualityScore != null && (
                            <p className="mt-2 text-xs text-muted-foreground leading-snug">
                                {format(t("match.s2.grammarQualityNote"), {
                                    quality: qualityScore,
                                    errors: errorSignal ?? 0,
                                })}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: AI insight */}
                <div className="lg:col-span-7 bg-card p-6 rounded-lg border border-border shadow-sm flex flex-col justify-between gap-4">
                    <div>
                        <div className="mb-4">
                            <h3 className="text-base font-bold text-foreground">
                                {t("match.s2.focusTitle")}
                            </h3>
                        </div>

                        <div>
                            {sortedFocus[0] && (
                                <p className="mb-4 rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm font-medium leading-relaxed text-foreground">
                                    {format(t("match.s2.focusSummary"), {
                                        skill: skillName(sortedFocus[0].code),
                                        band: assessment.cefr.band
                                            ? bandText(assessment.cefr.band)
                                            : t("match.s2.bandUnknown"),
                                    })}
                                </p>
                            )}
                            <div className="space-y-3">
                                {sortedFocus.slice(0, 3).map((f, i) => (
                                    <div
                                        key={f.code}
                                        className={`rounded-lg p-3 ${FOCUS_TAG_CLASS[i] ?? FOCUS_TAG_CLASS[2]}`}
                                    >
                                        <div className="flex items-center justify-between gap-3 text-sm font-bold">
                                            <span>{skillName(f.code)}</span>
                                            <span>
                                                {f.weightPct.toFixed(0)}%
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                                            {focusReason(f.code)}
                                        </p>
                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/70">
                                            <div
                                                className={`h-full rounded-full ${FOCUS_BAR_CLASS[i] ?? FOCUS_BAR_CLASS[2]}`}
                                                style={{
                                                    width: `${f.weightPct}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {assessment.cefr.lowConfidence && (
                        <div className="pt-3 border-t border-border bg-muted px-4 py-2.5 rounded flex items-center gap-2.5">
                            <span className="text-[13px] text-foreground">
                                {t("match.s2.confNote")}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Corrections — bằng chứng thật từ bài nộp.
          Chỉ accepted mới tính vào điểm (rejected đếm riêng, không liệt kê). */}
            <div className="mt-6 bg-card p-6 rounded-lg border border-border shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                        <h3 className="text-base font-bold text-foreground">
                            {t("match.s2.correctionsTitle")}
                        </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            className="rounded-full text-xs border-border text-muted-foreground dark:text-slate-300"
                        >
                            {format(t("match.s2.correctionScored"), {
                                n:
                                    assessment.grammar.acceptedChanges ??
                                    scoredChanges.length,
                            })}
                        </Badge>
                        {(assessment.grammar.rejectedChanges ?? 0) > 0 && (
                            <Badge
                                variant="outline"
                                className="rounded-full text-xs border-border text-muted-foreground dark:text-slate-300"
                            >
                                {format(t("match.s2.correctionIgnored"), {
                                    n: assessment.grammar.rejectedChanges ?? 0,
                                })}
                            </Badge>
                        )}
                    </div>
                </div>

                {qualityScore === 100 ? (
                    /* Không khẳng định "hoàn hảo" — chỉ nói model không tìm thấy lỗi. */
                    <p className="text-sm text-muted-foreground">
                        {t("match.s2.grammarNoErrors")}
                    </p>
                ) : scoredChanges.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {t("match.s2.correctionsEmpty")}
                    </p>
                ) : (
                    <div className="space-y-2">
                        {scoredChanges.map((c, i) => (
                            <div
                                key={`${c.chunk}-${c.char_start ?? "n"}-${i}`}
                                className="bg-muted p-3 rounded"
                            >
                                <span className="block text-xs text-primary font-bold mb-1">
                                    {i + 1}. {correctionTypeLabel(c.type)}
                                </span>
                                <div className="text-[13px] leading-snug">
                                    <span className="text-muted-foreground">
                                        {t("match.s2.correctionOriginal")}:{" "}
                                    </span>
                                    <span className="text-destructive line-through">
                                        {c.original || "—"}
                                    </span>
                                    <br />
                                    <span className="text-foreground font-semibold">
                                        {t("match.s2.correctionSuggested")}
                                        :{" "}
                                    </span>
                                    <span className="text-foreground font-bold">
                                        {c.corrected}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

/** Compact status cards for pipeline progress — real assessment fields. */
export function PipelineStatus({
    assessment,
    stage,
}: {
    assessment: WritingAssessment | null;
    stage: "idle" | "analyzing" | "matching" | "done";
}) {
    const { t } = useI18n();

    const skillName = (code: string): string =>
        SKILL_CODE_KEYS[code] ? t(SKILL_CODE_KEYS[code]) : code;
    const relName = (value: string): string =>
        RELIABILITY_KEYS[value] ? t(RELIABILITY_KEYS[value]) : value;

    const statusLabel =
        stage === "analyzing"
            ? t("match.pipe.analyzing")
            : stage === "matching"
              ? t("match.pipe.matching")
              : stage === "done"
                ? t("match.pipe.done")
                : t("match.pipe.ready");

    const stagePill =
        stage === "done"
            ? "border border-secondary/50 bg-secondary/15 text-foreground"
            : stage === "idle"
              ? "bg-muted text-muted-foreground"
              : "border border-primary/40 bg-primary/10 text-foreground";

    const vocabText = assessment?.cefr.band
        ? `${format(t("match.pipe.vocabPrefix"), {
              band: assessment.cefr.band,
              n:
                  assessment.cefr.coverage != null
                      ? Math.round(assessment.cefr.coverage * 100)
                      : "—",
          })} ${
              assessment.cefr.lowConfidence
                  ? t("match.pipe.vocabLow")
                  : t("match.pipe.vocabOk")
          }`
        : t("match.pipe.vocabIdle");

    const grammarText = assessment?.grammar.reliability
        ? format(t("match.pipe.grammarReady"), {
              label: relName(assessment.grammar.reliability),
              n: assessment.grammar.errorSignalPer100w ?? "—",
              m: assessment.grammar.acceptedChanges ?? 0,
          })
        : t("match.pipe.grammarIdle");

    let topFocus = t("match.pipe.mappingIdle");
    if (assessment?.focusTargets.length) {
        const sorted = [...assessment.focusTargets].sort(
            (a, b) => b.weightPct - a.weightPct,
        );
        topFocus = format(t("match.pipe.mappingReady"), {
            n: sorted.length,
            skill: skillName(sorted[0].code),
        });
    }

    return (
        <section className="w-full bg-card rounded-lg p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                    <div
                        className={`w-3 h-3 rounded-full ${
                            stage === "idle"
                                ? "bg-muted-foreground/40"
                                : stage === "done"
                                  ? "bg-secondary"
                                  : "bg-primary animate-ping"
                        }`}
                    />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                        {t("match.pipe.title")}
                    </h3>
                </div>
                <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${stagePill}`}
                >
                    {statusLabel}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-muted p-4 rounded">
                    <div className="min-w-0">
                        <span className="text-[13px] font-bold text-foreground block">
                            {t("match.pipe.vocabTitle")}
                        </span>
                        <span className="text-[14px] text-muted-foreground leading-relaxed">
                            {vocabText}
                        </span>
                    </div>
                </div>

                <div className="bg-muted p-4 rounded">
                    <div className="min-w-0">
                        <span className="text-[13px] font-bold text-foreground block">
                            {t("match.pipe.grammarTitle")}
                        </span>
                        <span className="text-[14px] text-muted-foreground leading-relaxed">
                            {grammarText}
                        </span>
                    </div>
                </div>

                <div className="bg-muted p-4 rounded col-span-full md:col-span-1">
                    <div className="min-w-0">
                        <span className="text-[13px] font-bold text-foreground block">
                            {t("match.pipe.mappingTitle")}
                        </span>
                        <span className="text-[14px] text-muted-foreground leading-relaxed">
                            {topFocus}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
