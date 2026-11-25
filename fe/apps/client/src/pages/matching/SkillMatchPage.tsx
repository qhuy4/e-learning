import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { Pagination } from "@fe/components/common/Pagination";
import { Skeleton } from "@fe/components/ui/skeleton";
import { Textarea } from "@fe/components/ui/textarea";
import { useI18n } from "@/i18n/use-i18n";
import { AssessmentInsights } from "@/features/matching/components/assessment-insights";
import { ErrorBanner } from "@/features/matching/components/error-banner";
import { LearnerProfilePanel } from "@/features/matching/components/learner-profile-panel";
import { ListeningPanel } from "@/features/matching/components/listening-panel";
import { SpeakingPanel } from "@/features/matching/components/speaking-panel";
import {
    InsufficientCard,
    MatchingResultCard,
} from "@/features/matching/components/matching-result-card";
import { QuizPanel } from "@/features/matching/components/quiz-panel";
import { SelfAssessmentCard } from "@/features/matching/components/self-assessment-card";
import {
    format,
    SKILL_CODE_KEYS,
} from "@/features/matching/config/matching.config";
import {
    useAnalyzeWriting,
    useLearnerProfile,
    useMatchFromProfile,
    useSkillCatalog,
    useCourseMatches,
    useGenerateRoadmap,
    useRoadmap,
    useReassessRoadmap,
} from "@/features/matching/hooks/use-matching";
import { apiErrorMessage } from "@/features/matching/lib/api-error";
import { WRITING_PRESETS } from "@/features/matching/presets";
import {
    type MatchingFromAssessmentResponse,
    type MatchingResponse,
    type WritingAssessment,
} from "@/features/matching/types/matching.type";

const MIN_TEXT_LENGTH = 80;
const MAX_TEXT_LENGTH = 4000;
/** Hai hàng, mỗi hàng tối đa ba giảng viên trên desktop. */
const MATCH_PAGE_SIZE = 6;
type MatchStep = 1 | 2 | 3 | 4 | 5 | 6;

function matchStepFromSearch(value: string | null): MatchStep {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= 6
        ? (parsed as MatchStep)
        : 1;
}

function positivePageFromSearch(value: string | null): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}
const BAND_SCORE: Record<string, number> = {
    "pre-A1": 5,
    A1: 20,
    A2: 35,
    B1: 50,
    B2: 65,
    C1: 80,
    C2: 95,
};
const ROADMAP_LEVELS = ["A1", "A2", "B1", "B2"] as const;

function useSkillName() {
    const { t } = useI18n();
    return (code: string): string =>
        SKILL_CODE_KEYS[code] ? t(SKILL_CODE_KEYS[code]) : code;
}

function MatchingResults({
    result,
    pending,
    errorMessage,
    onRetry,
    emptyHint,
    needFit,
}: {
    result: MatchingResponse | null;
    pending: boolean;
    errorMessage?: string;
    onRetry?: () => void;
    emptyHint: string;
    needFit?: MatchingFromAssessmentResponse["needFit"] | null;
}) {
    const { t } = useI18n();
    const skillName = useSkillName();
    const [searchParams, setSearchParams] = useSearchParams();
    const rankedPage = positivePageFromSearch(searchParams.get("teacherPage"));
    const setRankedPage = (page: number) => {
        setSearchParams(
            (current) => {
                const next = new URLSearchParams(current);
                if (page <= 1) next.delete("teacherPage");
                else next.set("teacherPage", String(page));
                return next;
            },
            { replace: true },
        );
    };
    const targetWeightTotal =
        result?.targets.reduce((sum, target) => sum + target.weight, 0) ?? 0;
    const rankedTotalPages = Math.max(
        1,
        Math.ceil((result?.ranked.length ?? 0) / MATCH_PAGE_SIZE),
    );
    // Clamp như BookingHistoryTab: kết quả mới ngắn hơn → tự lùi về trang hợp lệ.
    const rankedCurrentPage = Math.min(rankedPage, rankedTotalPages);
    const rankedStart = (rankedCurrentPage - 1) * MATCH_PAGE_SIZE;
    const visibleRanked = (result?.ranked ?? []).slice(
        rankedStart,
        rankedStart + MATCH_PAGE_SIZE,
    );

    return (
        <section className="flex flex-col gap-5 col-span-2" aria-live="polite">
            {errorMessage && (
                <ErrorBanner message={errorMessage} onRetry={onRetry} />
            )}

            {pending && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {Array.from({ length: 3 }, (_, i) => (
                        <Skeleton key={i} className="h-80 rounded-lg" />
                    ))}
                </div>
            )}

            {result && !pending && (
                <>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-bold text-foreground">
                            {format(t("match.results.ranked"), {
                                n: result.meta.rankedCount,
                            })}
                        </span>
                        <span>·</span>
                        <span>
                            {format(t("match.results.insufficient"), {
                                n: result.meta.insufficientCount,
                            })}
                        </span>
                        <span>·</span>
                        <span>
                            {format(t("match.results.eligible"), {
                                n: result.meta.eligible,
                            })}
                        </span>
                    </div>

                    {result.meta.levelFilter && (
                        <div className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
                            {t("match.results.levelPrefix")}{" "}
                            <strong>
                                {result.meta.levelFilter.studentLevel}
                            </strong>
                            {result.meta.levelFilter.enabled
                                ? format(t("match.results.levelExcluded"), {
                                      n: result.meta.levelFilter.excludedCount,
                                  })
                                : t("match.results.levelNone")}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-muted-foreground font-semibold">
                            {t("match.results.targets")}
                        </span>
                        {result.targets.map((target) => (
                            <Badge
                                key={target.skillId}
                                variant="secondary"
                                className="rounded-full border-secondary/50 bg-secondary/15 text-foreground"
                            >
                                {target.name} ·{" "}
                                {targetWeightTotal > 0
                                    ? `${Math.round((target.weight / targetWeightTotal) * 100)}%`
                                    : "—"}
                            </Badge>
                        ))}
                    </div>

                    {needFit && (
                        <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
                            <p className="font-bold text-foreground">
                                {t("match.results.needFitTitle")}
                            </p>
                            {needFit.targets.map((target) => (
                                <div
                                    key={target.code}
                                    className="grid grid-cols-[minmax(84px,120px)_1fr_auto] items-center gap-3"
                                >
                                    <span className="text-xs font-semibold text-foreground">
                                        {skillName(target.code)}
                                    </span>
                                    <span className="h-2 overflow-hidden rounded-full bg-muted">
                                        <span
                                            className="block h-full rounded-full bg-secondary"
                                            style={{
                                                width: `${Math.round((target.instructorMean ?? 0) * 100)}%`,
                                            }}
                                        />
                                    </span>
                                    <span className="text-xs font-bold text-foreground tabular-nums">
                                        {target.instructorMean != null
                                            ? `${Math.round(target.instructorMean * 100)}%`
                                            : "—"}
                                    </span>
                                </div>
                            ))}
                            {needFit.weakestTarget && (
                                <p className="rounded-lg bg-accent px-3 py-2 text-xs text-accent-foreground">
                                    {t("match.results.weakestReadable")}{" "}
                                    <strong>
                                        {skillName(needFit.weakestTarget.code)}
                                    </strong>
                                </p>
                            )}
                        </div>
                    )}

                    {result.ranked.length === 0 &&
                    result.insufficient.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
                            <Search
                                className="mx-auto text-muted-foreground mb-3"
                                size={32}
                            />
                            <p className="font-bold text-foreground">
                                {t("match.results.emptyTitle")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {emptyHint}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
                                {visibleRanked.map((item, index) => (
                                    <MatchingResultCard
                                        key={item.instructor.id}
                                        result={item}
                                        rank={rankedStart + index + 1}
                                    />
                                ))}
                            </div>

                            {result.ranked.length > MATCH_PAGE_SIZE && (
                                <Pagination
                                    page={rankedCurrentPage}
                                    onPageChange={setRankedPage}
                                    totalPages={rankedTotalPages}
                                    totalItems={result.ranked.length}
                                    limit={MATCH_PAGE_SIZE}
                                    itemLabel="giảng viên"
                                />
                            )}

                            {result.insufficient.length > 0 && (
                                <div className="flex flex-col gap-3 mt-2">
                                    <p className="text-sm font-bold text-foreground">
                                        {format(
                                            t(
                                                "match.results.insufficientTitle",
                                            ),
                                            {
                                                n: result.insufficient.length,
                                            },
                                        )}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {result.insufficient.map((item) => (
                                            <InsufficientCard
                                                key={item.instructor.id}
                                                item={item}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {!result && !pending && !errorMessage && (
                <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
                    <Search
                        className="mx-auto text-muted-foreground mb-3"
                        size={32}
                    />
                    <p className="font-bold text-foreground">{emptyHint}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t("match.results.emptyHint")}
                    </p>
                </div>
            )}
        </section>
    );
}

const PIPELINE_STEPS = [
    {
        n: 1,
        labelKey: "match.hero.step1Label",
        valueKey: "match.hero.step1Value",
    },
    {
        n: 2,
        labelKey: "match.hero.step2Label",
        valueKey: "match.hero.step2Value",
    },
    {
        n: 3,
        labelKey: "match.hero.step3Label",
        valueKey: "match.hero.step3Value",
    },
    {
        n: 4,
        labelKey: "match.hero.step4Label",
        valueKey: "match.hero.step4Value",
    },
] as const;

const WIZARD_STEPS = [
    { n: 1, key: "match.wizard.step1" },
    { n: 2, key: "match.wizard.step2" },
    { n: 3, key: "match.wizard.step3" },
    { n: 4, key: "match.wizard.step4" },
    { n: 5, key: "match.wizard.step5" },
    { n: 6, key: "match.wizard.step7" },
] as const;

function SectionHeader({
    area,
    title,
    subtitle,
    compact = false,
}: {
    area: string;
    title: string;
    subtitle?: string;
    compact?: boolean;
}) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
            <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                    {area}
                </span>
                <h2
                    className={`${compact ? "text-lg md:text-xl" : "text-[22px] md:text-[26px]"} font-bold text-foreground`}
                >
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-sm text-muted-foreground dark:text-slate-300 max-w-3xl mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function SkillMatchPage() {
    const { t } = useI18n();
    const courseSkillName = useSkillName();
    const [searchParams, setSearchParams] = useSearchParams();
    const [text, setText] = useState("");
    const [requireLevelMatch, setRequireLevelMatch] = useState(
        () => searchParams.get("level") === "exact",
    );
    const [priceMode, setPriceMode] = useState<"ALL" | "FREE" | "PAID">(() => {
        const value = searchParams.get("price");
        return value === "FREE" || value === "PAID" ? value : "ALL";
    });
    const [minHourlyRate, setMinHourlyRate] = useState(
        () => searchParams.get("minPrice") ?? "",
    );
    const [maxHourlyRate, setMaxHourlyRate] = useState(
        () => searchParams.get("maxPrice") ?? "",
    );
    const [assessment, setAssessment] = useState<WritingAssessment | null>(
        null,
    );

    // self → quiz → writing → listening → speaking → teachers
    const step = matchStepFromSearch(searchParams.get("step"));
    const setStep = (nextStep: MatchStep) => {
        setSearchParams(
            (current) => {
                const next = new URLSearchParams(current);
                next.set("step", String(nextStep));
                return next;
            },
            { replace: true },
        );
    };
    const [selfBand, setSelfBand] = useState<string | null>(null);
    const [sessionQuizBand, setSessionQuizBand] = useState<string | null>(null);
    const [writingExpanded, setWritingExpanded] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
    const [quizIndex, setQuizIndex] = useState(0);
    // Matching tự chạy tối đa 1 lần cho mỗi lần có bằng chứng mới (không loop).
    const autoMatched = useRef(false);
    const initialResumeChecked = useRef(false);

    const analyze = useAnalyzeWriting();
    const profile = useLearnerProfile();
    const match = useMatchFromProfile();
    const catalog = useSkillCatalog();
    const courseMatches = useCourseMatches(step === 6);
    const roadmap = useRoadmap(step === 6);
    const generateRoadmap = useGenerateRoadmap();
    const reassessRoadmap = useReassessRoadmap();

    const shownAssessment = assessment;
    const textError =
        text.length > 0 && text.trim().length < MIN_TEXT_LENGTH
            ? format(t("match.s1.minError"), { n: MIN_TEXT_LENGTH })
            : text.length > MAX_TEXT_LENGTH
              ? format(t("match.s1.maxError"), { n: MAX_TEXT_LENGTH })
              : undefined;

    const learnerProfile = profile.data ?? null;
    const selectedBand =
        selfBand ?? learnerProfile?.selfAssessment?.band ?? null;
    const quizBand = sessionQuizBand ?? learnerProfile?.quiz?.band ?? null;
    const writingRecommended =
        ["B2", "C1", "C2"].includes(selectedBand ?? "") ||
        ["B2", "C1", "C2"].includes(quizBand ?? "");
    const showWriting = writingExpanded || writingRecommended;
    const speakingOptional = !["pre-A1", "A1", "A2", "B1"].includes(
        selectedBand ?? "",
    );
    const goalTargets = useMemo(() => {
        const skillIdByCode = new Map(
            (catalog.data ?? []).map((skill) => [skill.code, skill.id]),
        );
        return (learnerProfile?.skills ?? [])
            .filter((skill) => skill.status === "assessed")
            .map((skill) => ({
                skillId: skillIdByCode.get(skill.code),
                score:
                    skill.scorePct ??
                    skill.qualityScore ??
                    (skill.band ? BAND_SCORE[skill.band] : undefined),
            }))
            .filter(
                (skill): skill is { skillId: number; score: number } =>
                    skill.skillId != null && skill.score != null,
            )
            .sort((a, b) => a.score - b.score || a.skillId - b.skillId)
            .slice(0, 3)
            .map(({ skillId }) => ({ skillId, weight: 1 }));
    }, [catalog.data, learnerProfile?.skills]);
    const canFind =
        !!learnerProfile?.quiz?.band &&
        (learnerProfile.quiz.total ?? 0) >= 15 &&
        goalTargets.length >= 1;
    const hasSavedAssessment = Boolean(
        learnerProfile?.quiz ||
        learnerProfile?.writing ||
        learnerProfile?.listening ||
        learnerProfile?.speaking,
    );

    const busy = analyze.isPending || match.isPending;
    const priceFilter = useMemo(
        () => ({
            priceMode,
            ...(priceMode === "PAID" && minHourlyRate !== ""
                ? { minHourlyRate: Number(minHourlyRate) }
                : {}),
            ...(priceMode === "PAID" && maxHourlyRate !== ""
                ? { maxHourlyRate: Number(maxHourlyRate) }
                : {}),
        }),
        [maxHourlyRate, minHourlyRate, priceMode],
    );

    // URL là nguồn trạng thái điều hướng: mở hồ sơ/khóa học rồi Back vẫn giữ
    // đúng bước kết quả và bộ lọc đã dùng để tạo danh sách.
    useEffect(() => {
        setSearchParams(
            (current) => {
                const next = new URLSearchParams(current);
                if (requireLevelMatch) next.set("level", "exact");
                else next.delete("level");
                if (priceMode === "ALL") next.delete("price");
                else next.set("price", priceMode);
                if (minHourlyRate) next.set("minPrice", minHourlyRate);
                else next.delete("minPrice");
                if (maxHourlyRate) next.set("maxPrice", maxHourlyRate);
                else next.delete("maxPrice");
                return next;
            },
            { replace: true },
        );
    }, [
        maxHourlyRate,
        minHourlyRate,
        priceMode,
        requireLevelMatch,
        setSearchParams,
    ]);

    // Khi route được mount lại ở bước mặc định, tiếp tục từ dữ liệu đã lưu thay
    // vì bắt học viên làm lại. Sau lần khôi phục này, họ vẫn có thể chủ động
    // bấm về Bước 1 trong cùng phiên để đánh giá lại.
    useEffect(() => {
        if (initialResumeChecked.current) {
            return;
        }
        const requestedStep = matchStepFromSearch(searchParams.get("step"));
        if (searchParams.has("step") && requestedStep !== 1) {
            initialResumeChecked.current = true;
            return;
        }
        if (profile.isLoading || catalog.isLoading) return;
        initialResumeChecked.current = true;

        const resumeStep: MatchStep = hasSavedAssessment
            ? 6
            : learnerProfile?.selfAssessment
              ? 2
              : 1;
        if (resumeStep === 1) return;
        setSearchParams(
            (current) => {
                const next = new URLSearchParams(current);
                next.set("step", String(resumeStep));
                return next;
            },
            { replace: true },
        );
    }, [
        catalog.isLoading,
        hasSavedAssessment,
        learnerProfile?.selfAssessment,
        profile.isLoading,
        searchParams,
        setSearchParams,
    ]);
    // Tự tìm giảng viên theo tối đa 3 kỹ năng yếu nhất đã đo được.
    useEffect(() => {
        if (step !== 6 || !canFind || autoMatched.current) return;
        autoMatched.current = true;
        match.mutate({
            targets: goalTargets,
            requireLevelMatch,
            ...priceFilter,
        });
    }, [step, canFind, goalTargets, match, requireLevelMatch, priceFilter]);

    const handleFind = () => {
        if (!canFind || match.isPending) return;
        match.mutate({
            targets: goalTargets,
            requireLevelMatch,
            ...priceFilter,
        });
    };

    const handleAnalyze = async () => {
        if (textError || !text.trim() || analyze.isPending) return;
        try {
            const data = await analyze.mutateAsync(text.trim());
            setAssessment(data);
            // Bằng chứng mới → cho phép auto-match chạy lại ở Bước 3.
            autoMatched.current = false;
            setStep(4);
        } catch {
            /* errors surfaced via mutation state */
        }
    };

    const handleQuizDone = (attempt: { band: string | null }) => {
        setSessionQuizBand(attempt.band);
        autoMatched.current = false;
        setStep(3);
    };

    const handleClear = () => {
        setText("");
        setAssessment(null);
    };

    const matchResult = match.data ?? null;
    const matchError = apiErrorMessage(match.error);
    const analyzeError = apiErrorMessage(analyze.error);
    const profileError = apiErrorMessage(profile.error);
    const roadmapCurrentLevelIndex = ROADMAP_LEVELS.indexOf(
        (roadmap.data?.currentLevel ?? "") as (typeof ROADMAP_LEVELS)[number],
    );
    const roadmapRemainingStages =
        roadmap.data?.stages.filter(
            (stage) =>
                stage.status !== "COMPLETED" && stage.status !== "SKIPPED",
        ).length ?? 0;

    return (
        <div className="min-h-screen bg-m3-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
                {/* 00 HERO */}
                <header className="flex flex-col items-center text-center max-w-4xl mx-auto gap-4">
                    <div className="inline-flex bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full">
                        <span className="text-[13px] font-bold tracking-wider uppercase">
                            {t("match.hero.eyebrow")}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl leading-tight font-extrabold text-foreground tracking-tight">
                        {t("match.hero.title")}
                        <br />
                        <span className="text-primary">
                            {t("match.hero.titleAccent")}
                        </span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
                        {t("match.hero.subtitle")}
                    </p>

                    <div className="w-full pt-4">
                        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                                {PIPELINE_STEPS.map((pipelineStep) => (
                                    <div
                                        key={pipelineStep.n}
                                        className="flex items-center gap-2.5 bg-muted px-4 py-2 rounded"
                                    >
                                        <span className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground font-bold text-sm flex items-center justify-center shrink-0">
                                            {pipelineStep.n}
                                        </span>
                                        <div className="text-left min-w-0">
                                            <span className="block text-xs uppercase tracking-wider font-bold text-primary">
                                                {t(pipelineStep.labelKey)}
                                            </span>
                                            <span className="block text-[13px] font-semibold text-foreground truncate">
                                                {t(pipelineStep.valueKey)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </header>

                {/* WIZARD NAV — 3 bước: Self-assessment → Assessment → Teachers */}
                <nav className="w-full bg-card rounded-lg px-4 py-3 shadow-sm border border-border">
                    <ol className="flex flex-wrap items-center gap-2">
                        {WIZARD_STEPS.map((wizardStep) => {
                            const active = step === wizardStep.n;
                            const done = wizardStep.n < step;
                            return (
                                <li
                                    key={wizardStep.n}
                                    className="flex items-center gap-2"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setStep(wizardStep.n)}
                                        disabled={wizardStep.n > step}
                                        aria-current={
                                            active ? "step" : undefined
                                        }
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold border transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                                            active
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : done
                                                  ? "bg-secondary text-secondary-foreground border-secondary"
                                                  : "bg-card text-muted-foreground border-border hover:border-input"
                                        }`}
                                    >
                                        <span
                                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                                                active
                                                    ? "bg-primary-foreground text-primary"
                                                    : "bg-muted text-foreground"
                                            }`}
                                        >
                                            {wizardStep.n}
                                        </span>
                                        {t(wizardStep.key)}
                                    </button>
                                    {wizardStep.n < 6 && (
                                        <span
                                            className="text-muted-foreground"
                                            aria-hidden
                                        >
                                            →
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>

                {/* BƯỚC 1 — SELF-ASSESSMENT */}
                {step === 1 && (
                    <section className="w-full bg-card rounded-lg p-5 lg:p-6 shadow-sm border border-border">
                        <SectionHeader
                            area={t("match.self.area")}
                            title={t("match.self.title")}
                            subtitle={t("match.self.subtitle")}
                        />
                        <SelfAssessmentCard
                            saved={learnerProfile?.selfAssessment ?? null}
                            onContinue={(band) => {
                                setSelfBand(band);
                                setStep(2);
                            }}
                        />
                    </section>
                )}

                {/* BƯỚC 2 — QUIZ TỪ VỰNG (bắt buộc) */}
                {step === 2 && (
                    <section className="w-full bg-card rounded-lg p-5 lg:p-6 shadow-sm border border-border">
                        <SectionHeader
                            area={t("match.quiz.area")}
                            title={t("match.quiz.title")}
                            subtitle={t("match.quiz.subtitle")}
                        />

                        <QuizPanel
                            answers={quizAnswers}
                            onAnswersChange={setQuizAnswers}
                            index={quizIndex}
                            onIndexChange={setQuizIndex}
                            onDone={handleQuizDone}
                        />

                        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-border">
                            <Button
                                variant="outline"
                                className="rounded-full font-semibold cursor-pointer"
                                onClick={() => setStep(1)}
                            >
                                {t("match.wizard.back")}
                            </Button>
                        </div>
                    </section>
                )}

                {/* BƯỚC 3 — WRITING (tuỳ chọn) */}
                {step === 3 && (
                    <section className="w-full bg-card rounded-lg p-5 lg:p-6 shadow-sm border border-border">
                        <SectionHeader
                            area={t("match.writing.area")}
                            title={t("match.writing.title")}
                            subtitle={
                                writingRecommended
                                    ? t("match.writing.recommended")
                                    : t("match.writing.optional")
                            }
                        />

                        {!showWriting ? (
                            <div className="rounded-lg border border-border bg-muted px-5 py-4 flex flex-col gap-4">
                                <p className="text-sm text-muted-foreground">
                                    {t("match.writing.hidden")}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        variant="outline"
                                        className="rounded-full font-semibold cursor-pointer"
                                        onClick={() => setWritingExpanded(true)}
                                    >
                                        {t("match.writing.expand")}
                                    </Button>
                                    <Button
                                        className="rounded-full font-bold cursor-pointer"
                                        onClick={() => setStep(4)}
                                    >
                                        {t("match.writing.skip")}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/40 p-4 md:p-5">
                                <div>
                                    <h3 className="font-bold text-foreground">
                                        {t("match.quiz.writingTitle")}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground dark:text-slate-300">
                                        {t("match.quiz.writingHelp")}
                                    </p>
                                </div>
                                {/* Preset chips */}
                                <div className="mb-4">
                                    <label className="block text-[13px] text-muted-foreground mb-2 font-semibold">
                                        {t("match.s1.presetsLabel")}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {WRITING_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() =>
                                                    setText(preset.text)
                                                }
                                                className="px-4 py-1.5 bg-card hover:bg-secondary text-foreground hover:text-secondary-foreground rounded-full text-[13px] font-semibold transition-colors border border-border hover:border-secondary cursor-pointer"
                                            >
                                                {t(preset.labelKey)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Textarea */}
                                <div className="relative bg-muted rounded p-4 mb-2 focus-within:bg-background transition-colors border border-border focus-within:border-piemind-pink/40">
                                    <Textarea
                                        value={text}
                                        onChange={(e) =>
                                            setText(e.target.value)
                                        }
                                        rows={5}
                                        placeholder={t("match.s1.placeholder")}
                                        className="w-full bg-transparent border-0 focus-visible:ring-0 focus-visible:border-0 shadow-none text-base resize-none placeholder:text-muted-foreground/50 px-0 py-0"
                                        aria-label={t("match.s1.title")}
                                    />
                                    <div className="flex items-center justify-between pt-2 text-muted-foreground text-[12px] gap-2 flex-wrap">
                                        <span>{t("match.s1.security")}</span>
                                        <span
                                            className={`font-bold ${textError ? "text-destructive" : "text-foreground"}`}
                                        >
                                            {textError ??
                                                format(t("match.s1.counter"), {
                                                    n: text.length,
                                                    m: MAX_TEXT_LENGTH,
                                                })}
                                        </span>
                                    </div>
                                </div>

                                {/* Pipeline scope */}
                                <div className="bg-muted px-4 py-2.5 rounded mb-5">
                                    <p className="text-[13px] text-muted-foreground">
                                        <strong className="text-foreground">
                                            {t("match.s1.scopeStrong")}
                                        </strong>{" "}
                                        {t("match.s1.scopeRest")}
                                    </p>
                                </div>

                                {/* CTA — phân tích writing rồi sang chọn mục tiêu */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                    <Button
                                        className="w-full sm:w-auto h-auto px-6 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base rounded-full cursor-pointer"
                                        disabled={
                                            !!textError ||
                                            text.trim().length === 0 ||
                                            busy
                                        }
                                        onClick={handleAnalyze}
                                    >
                                        {analyze.isPending
                                            ? t("match.s1.ctaAnalyzing")
                                            : t("match.s1.cta")}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto h-auto px-5 py-3.5 font-semibold text-base rounded-full cursor-pointer"
                                        disabled={busy}
                                        onClick={() => setStep(4)}
                                    >
                                        {t("match.writing.skip")}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto h-auto px-5 py-3.5 font-semibold text-base rounded-full cursor-pointer"
                                        disabled={busy}
                                        onClick={handleClear}
                                    >
                                        <RotateCcw size={18} />
                                        {t("match.s1.clear")}
                                    </Button>
                                </div>

                                {analyzeError && (
                                    <p className="text-sm text-destructive font-medium">
                                        {analyzeError}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-border">
                            <Button
                                variant="outline"
                                className="rounded-full font-semibold cursor-pointer"
                                onClick={() => setStep(2)}
                            >
                                {t("match.wizard.back")}
                            </Button>
                        </div>
                    </section>
                )}

                {/* BƯỚC 4 — LISTENING (tuỳ chọn) */}
                {step === 4 && (
                    <section className="w-full bg-card rounded-lg p-5 lg:p-6 shadow-sm border border-border">
                        <SectionHeader
                            area={t("match.listening.area")}
                            title={t("match.listening.title")}
                            subtitle={t("match.listening.subtitle")}
                        />
                        <ListeningPanel
                            onDone={() => setStep(5)}
                            onSkip={() => setStep(5)}
                        />
                        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-border">
                            <Button
                                variant="outline"
                                className="rounded-full font-semibold cursor-pointer"
                                onClick={() => setStep(3)}
                            >
                                {t("match.wizard.back")}
                            </Button>
                        </div>
                    </section>
                )}

                {/* BƯỚC 5 — SPEAKING (tuỳ chọn) */}
                {step === 5 && (
                    <section className="w-full bg-card rounded-lg p-5 lg:p-6 shadow-sm border border-border">
                        <SectionHeader
                            area={t("match.speaking.area")}
                            title={t(
                                speakingOptional
                                    ? "match.speaking.titleOptional"
                                    : "match.speaking.titleGuided",
                            )}
                            subtitle={t(
                                speakingOptional
                                    ? "match.speaking.subtitleOptional"
                                    : "match.speaking.subtitleGuided",
                            )}
                        />
                        <SpeakingPanel
                            onDone={() => setStep(6)}
                            onSkip={() => setStep(6)}
                            allowSkip={speakingOptional}
                        />
                        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-border">
                            <Button
                                variant="outline"
                                className="rounded-full font-semibold cursor-pointer"
                                onClick={() => setStep(4)}
                            >
                                {t("match.wizard.back")}
                            </Button>
                        </div>
                    </section>
                )}

                {/* BƯỚC 6 — HỒ SƠ & MATCHING */}
                {step === 6 && (
                    <>
                        {/* Kết quả bài viết — hiển thị trước hồ sơ để giữ đúng thứ tự Bước 02 → 03. */}
                        {shownAssessment && (
                            <AssessmentInsights assessment={shownAssessment} />
                        )}

                        <section className="w-full bg-card rounded-lg p-5 lg:p-6 shadow-sm border border-border">
                            <SectionHeader
                                area={t("match.profile.area")}
                                title={t("match.profile.title")}
                                subtitle={t("match.profile.subtitle")}
                                compact
                            />
                            <LearnerProfilePanel
                                profile={learnerProfile}
                                loading={profile.isLoading}
                                errorMessage={profileError}
                                onRetry={() => void profile.refetch()}
                                onFind={handleFind}
                                finding={match.isPending}
                                canFind={canFind}
                                requireLevelMatch={requireLevelMatch}
                                onRequireLevelMatchChange={setRequireLevelMatch}
                                priceMode={priceMode}
                                onPriceModeChange={setPriceMode}
                                minHourlyRate={minHourlyRate}
                                maxHourlyRate={maxHourlyRate}
                                onMinHourlyRateChange={setMinHourlyRate}
                                onMaxHourlyRateChange={setMaxHourlyRate}
                            />
                            <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-border">
                                <Button
                                    variant="outline"
                                    className="rounded-full font-semibold cursor-pointer"
                                    onClick={() => setStep(5)}
                                >
                                    {t("match.wizard.back")}
                                </Button>
                                {roadmap.data &&
                                    roadmap.data.status !== "COMPLETED" && (
                                        <Button
                                            disabled={
                                                reassessRoadmap.isPending ||
                                                roadmap.data
                                                    .reassessmentState ===
                                                    "LOCKED_STAGE"
                                            }
                                            onClick={() =>
                                                roadmap.data
                                                    ?.reassessmentState ===
                                                "NEEDS_ASSESSMENT"
                                                    ? setStep(2)
                                                    : reassessRoadmap.mutate()
                                            }
                                        >
                                            {reassessRoadmap.isPending
                                                ? t("match.roadmap.reassessing")
                                                : roadmap.data
                                                        .reassessmentState ===
                                                    "NEEDS_ASSESSMENT"
                                                  ? t(
                                                        "match.roadmap.takeReassessment",
                                                    )
                                                  : t("match.roadmap.reassess")}
                                        </Button>
                                    )}
                            </div>
                        </section>

                        <section className="w-full bg-card rounded-lg p-5 lg:p-6 shadow-sm border border-border">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <SectionHeader
                                    area={t("match.roadmap.area")}
                                    title={t("match.roadmap.title")}
                                    subtitle={t("match.roadmap.subtitle")}
                                    compact
                                />
                                {roadmap.data?.status !== "COMPLETED" && (
                                    <Button
                                        variant={
                                            roadmap.data ? "outline" : "default"
                                        }
                                        disabled={generateRoadmap.isPending}
                                        onClick={() => generateRoadmap.mutate()}
                                    >
                                        {generateRoadmap.isPending
                                            ? t("match.roadmap.generating")
                                            : roadmap.data
                                              ? t("match.roadmap.regenerate")
                                              : t("match.roadmap.generate")}
                                    </Button>
                                )}
                            </div>
                            {roadmap.data ? (
                                <div className="flex flex-col gap-3">
                                    <p className="text-sm font-semibold text-foreground">
                                        {roadmap.data.currentLevel} →{" "}
                                        {roadmap.data.targetLevel} ·{" "}
                                        {t("match.roadmap.revision")}{" "}
                                        {roadmap.data.revision}
                                    </p>
                                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {ROADMAP_LEVELS.map(
                                                (level, index) => (
                                                    <div
                                                        key={level}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Badge
                                                            variant={
                                                                roadmapCurrentLevelIndex >=
                                                                index
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                        >
                                                            {level}
                                                        </Badge>
                                                        {index <
                                                            ROADMAP_LEVELS.length -
                                                                1 && (
                                                            <span
                                                                className="text-muted-foreground"
                                                                aria-hidden
                                                            >
                                                                →
                                                            </span>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                        <p className="mt-3 text-xs text-muted-foreground">
                                            {format(
                                                t(
                                                    "match.roadmap.remainingSummary",
                                                ),
                                                {
                                                    current:
                                                        roadmap.data
                                                            .currentLevel,
                                                    target: roadmap.data
                                                        .targetLevel,
                                                    n: roadmapRemainingStages,
                                                },
                                            )}
                                        </p>
                                    </div>
                                    {roadmap.data.lastReassessment && (
                                        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                                            <p className="font-semibold text-foreground">
                                                {t(
                                                    "match.roadmap.lastAdjustment",
                                                )}
                                            </p>
                                            <p>
                                                {
                                                    roadmap.data
                                                        .lastReassessment
                                                        .previousLevel
                                                }{" "}
                                                →{" "}
                                                {
                                                    roadmap.data
                                                        .lastReassessment
                                                        .assessedLevel
                                                }{" "}
                                                · {t("match.roadmap.preserved")}{" "}
                                                {
                                                    roadmap.data
                                                        .lastReassessment
                                                        .preservedStages
                                                }{" "}
                                                · {t("match.roadmap.replaced")}{" "}
                                                {
                                                    roadmap.data
                                                        .lastReassessment
                                                        .replacedStages
                                                }{" "}
                                                · {t("match.roadmap.generated")}{" "}
                                                {
                                                    roadmap.data
                                                        .lastReassessment
                                                        .generatedStages
                                                }
                                            </p>
                                        </div>
                                    )}
                                    {roadmap.data.status === "COMPLETED" && (
                                        <p className="text-sm font-semibold text-emerald-600">
                                            {t("match.roadmap.targetReached")}
                                        </p>
                                    )}
                                    {roadmap.data.status === "ACTIVE" &&
                                        roadmap.data.reassessmentState ===
                                            "LOCKED_STAGE" && (
                                            <p className="text-xs text-muted-foreground">
                                                {t(
                                                    "match.roadmap.reassessLocked",
                                                )}
                                            </p>
                                        )}
                                    {roadmap.data.reassessmentState ===
                                        "NEEDS_ASSESSMENT" && (
                                        <p className="text-xs text-muted-foreground">
                                            {t(
                                                "match.roadmap.assessmentRequired",
                                            )}
                                        </p>
                                    )}
                                    {roadmap.data.stages.length ? (
                                        roadmap.data.stages.map((stage) => (
                                            <div
                                                key={stage.id}
                                                className={`grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center ${stage.status === "SKIPPED" ? "opacity-50" : ""}`}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="secondary">
                                                        {stage.position}
                                                    </Badge>
                                                    <span className="text-[10px] font-bold text-muted-foreground">
                                                        {t(
                                                            `match.roadmap.status.${stage.status}`,
                                                        )}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">
                                                        {stage.fromLevel} →{" "}
                                                        {stage.toLevel}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {stage.course
                                                            ? stage.course.title
                                                            : t(
                                                                  "match.roadmap.missingCourse",
                                                              )}
                                                        {stage.instructor
                                                            ? ` · ${stage.instructor.name}`
                                                            : ""}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {stage.course && (
                                                        <Link
                                                            to={`/courses/${stage.course.slug}`}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                {t(
                                                                    "match.courses.view",
                                                                )}
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {t("match.roadmap.targetReached")}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {t("match.roadmap.empty")}
                                </p>
                            )}
                        </section>

                        <section className="w-full bg-card rounded-lg p-5 lg:p-6 shadow-sm border border-border">
                            <SectionHeader
                                area={t("match.courses.area")}
                                title={t("match.courses.title")}
                                subtitle={t("match.courses.subtitle")}
                                compact
                            />
                            {courseMatches.isLoading ? (
                                <Skeleton className="h-40 rounded-xl" />
                            ) : courseMatches.data?.courses.length ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {courseMatches.data.courses.map(
                                        (course) => (
                                            <article
                                                key={course.id}
                                                className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-bold text-foreground">
                                                            {course.title}
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {
                                                                course
                                                                    .instructor
                                                                    .name
                                                            }{" "}
                                                            ·{" "}
                                                            {
                                                                course.cefrLevelStart
                                                            }
                                                            –
                                                            {
                                                                course.cefrLevelEnd
                                                            }
                                                        </p>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        {course.matchScore}%
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {course.matchedSkills.map(
                                                        (skill) => (
                                                            <Badge
                                                                key={skill}
                                                                variant="outline"
                                                            >
                                                                {courseSkillName(
                                                                    skill,
                                                                )}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                                <div className="mt-auto flex items-center justify-between gap-3">
                                                    <span className="text-sm font-bold text-foreground">
                                                        {course.price === 0
                                                            ? t(
                                                                  "match.courses.free",
                                                              )
                                                            : `${course.price.toLocaleString("vi-VN")}₫`}
                                                    </span>
                                                    <Link
                                                        to={`/courses/${course.slug}`}
                                                    >
                                                        <Button size="sm">
                                                            {t(
                                                                "match.courses.view",
                                                            )}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </article>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <p className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
                                    {t("match.courses.empty")}
                                </p>
                            )}
                        </section>

                        {/* 06 TEACHER MATCHES */}
                        <section className="w-full">
                            <SectionHeader
                                area={t("match.s3.area")}
                                title={t("match.s3.title")}
                                subtitle={t("match.s3.subtitle")}
                                compact
                            />
                            <MatchingResults
                                result={matchResult}
                                pending={match.isPending}
                                errorMessage={matchError}
                                onRetry={handleFind}
                                emptyHint={
                                    canFind
                                        ? t("match.results.hintAuto")
                                        : t("match.profile.noEvidence")
                                }
                                needFit={
                                    matchResult && "needFit" in matchResult
                                        ? matchResult.needFit
                                        : null
                                }
                            />
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
