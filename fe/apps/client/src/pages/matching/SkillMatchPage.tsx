import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, RotateCcw, Search } from "lucide-react";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@fe/components/ui/card";
import { Checkbox } from "@fe/components/ui/checkbox";
import { Skeleton } from "@fe/components/ui/skeleton";
import { Textarea } from "@fe/components/ui/textarea";
import { useI18n } from "@/i18n/use-i18n";
import { AssessmentInsights } from "@/features/matching/components/assessment-insights";
import { ErrorBanner } from "@/features/matching/components/error-banner";
import { LearnerProfilePanel } from "@/features/matching/components/learner-profile-panel";
import {
    InsufficientCard,
    MatchingResultCard,
} from "@/features/matching/components/matching-result-card";
import { QuizPanel } from "@/features/matching/components/quiz-panel";
import { SelfAssessmentCard } from "@/features/matching/components/self-assessment-card";
import {
    DEFAULT_PRIORITY,
    SkillTargetPicker,
} from "@/features/matching/components/skill-target-picker";
import {
    format,
    SKILL_CODE_KEYS,
} from "@/features/matching/config/matching.config";
import {
    useAnalyzeWriting,
    useLatestAssessment,
    useLearnerProfile,
    useMatchFromProfile,
    useMatching,
    useSkillCatalog,
} from "@/features/matching/hooks/use-matching";
import { apiErrorMessage } from "@/features/matching/lib/api-error";
import { WRITING_PRESETS } from "@/features/matching/presets";
import {
    CEFR_OPTIONS,
    type MatchingFromAssessmentResponse,
    type MatchingResponse,
    type WritingAssessment,
} from "@/features/matching/types/matching.type";

const MIN_TEXT_LENGTH = 80;
const MAX_TEXT_LENGTH = 4000;

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
    const targetWeightTotal =
        result?.targets.reduce((sum, target) => sum + target.weight, 0) ?? 0;

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
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                                {result.ranked.map((item, index) => (
                                    <MatchingResultCard
                                        key={item.instructor.id}
                                        result={item}
                                        rank={index + 1}
                                    />
                                ))}
                            </div>

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
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

function ManualSection() {
    const { t } = useI18n();
    const { data: skills, isLoading, isError, refetch } = useSkillCatalog();
    const matching = useMatching();

    const [selected, setSelected] = useState<Record<number, number>>({});
    const [studentLevel, setStudentLevel] = useState<string>("");
    const [requireLevelMatch, setRequireLevelMatch] = useState(false);

    const selectedIds = Object.keys(selected).map(Number);
    const totalWeight = selectedIds.reduce(
        (sum, id) => sum + (selected[id] ?? 0),
        0,
    );
    const validationError =
        selectedIds.length === 0 ? t("match.manual.validateEmpty") : undefined;

    const handleToggle = (skillId: number, checked: boolean) => {
        setSelected((prev) => {
            const next = { ...prev };
            if (checked) next[skillId] = DEFAULT_PRIORITY;
            else delete next[skillId];
            return next;
        });
    };

    const handleWeightChange = (skillId: number, weight: number) => {
        setSelected((prev) => ({ ...prev, [skillId]: weight }));
    };

    const handleSubmit = () => {
        if (validationError) return;
        matching.mutate({
            targets: selectedIds.map((skillId) => ({
                skillId,
                weight: selected[skillId],
            })),
            level: studentLevel
                ? { studentLevel, requireLevelMatch }
                : undefined,
        });
    };

    const weightChips = useMemo(
        () =>
            selectedIds
                .map((id) => ({
                    id,
                    name: skills?.find((s) => s.id === id)?.name ?? `#${id}`,
                    pct:
                        totalWeight > 0
                            ? ((selected[id] ?? 0) / totalWeight) * 100
                            : 0,
                }))
                .sort((a, b) => b.pct - a.pct),
        [selectedIds, selected, skills, totalWeight],
    );

    return (
        <div>
            <p className="text-sm leading-relaxed mb-2">
                {" "}
                {t("match.results.footnote")}{" "}
            </p>
            <div className="flex flex-row gap-6 grid grid-cols-3">
                <Card className="border-border shadow-sm ">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">
                            {t("match.manual.title")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {isError ? (
                            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 flex items-center justify-between gap-3">
                                <p className="text-sm text-destructive">
                                    {t("match.manual.skillsError")}
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => refetch()}
                                    className="rounded-full cursor-pointer"
                                >
                                    <RefreshCw size={14} />
                                    {t("match.error.retry")}
                                </Button>
                            </div>
                        ) : (
                            <SkillTargetPicker
                                skills={skills ?? []}
                                loading={isLoading}
                                selected={selected}
                                onToggle={handleToggle}
                                onWeightChange={handleWeightChange}
                            />
                        )}

                        {selectedIds.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                                    {t("match.manual.priorityShare")}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {weightChips.map((chip) => (
                                        <Badge
                                            key={chip.id}
                                            variant="outline"
                                            className="rounded-full border-primary/40 text-primary"
                                        >
                                            {chip.name} · {chip.pct.toFixed(0)}%
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Level sinh viên — optional */}
                        <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted px-4 py-3">
                            <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                                {t("match.manual.levelTitle")}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {CEFR_OPTIONS.map((band) => (
                                    <button
                                        key={band}
                                        type="button"
                                        onClick={() =>
                                            setStudentLevel((prev) =>
                                                prev === band ? "" : band,
                                            )
                                        }
                                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                                            studentLevel === band
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-card text-muted-foreground border-border hover:border-input"
                                        }`}
                                        aria-pressed={studentLevel === band}
                                    >
                                        {band}
                                    </button>
                                ))}
                            </div>
                            {studentLevel && (
                                <label className="flex items-center gap-2 mt-1 cursor-pointer">
                                    <Checkbox
                                        checked={requireLevelMatch}
                                        onCheckedChange={(checked) =>
                                            setRequireLevelMatch(
                                                checked === true,
                                            )
                                        }
                                    />
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {t("match.level.strict")}
                                    </span>
                                </label>
                            )}
                        </div>

                        <Button
                            className="w-full rounded-full cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                            disabled={!!validationError || matching.isPending}
                            onClick={handleSubmit}
                        >
                            <Search size={16} />
                            {matching.isPending
                                ? t("match.manual.submitting")
                                : t("match.manual.submit")}
                        </Button>
                    </CardContent>
                </Card>

                <MatchingResults
                    result={matching.data ?? null}
                    pending={matching.isPending}
                    errorMessage={apiErrorMessage(matching.error)}
                    onRetry={handleSubmit}
                    emptyHint={t("match.results.hintManual")}
                />
            </div>
        </div>
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
    const [text, setText] = useState("");
    const [requireLevelMatch, setRequireLevelMatch] = useState(true);
    const [assessment, setAssessment] = useState<WritingAssessment | null>(
        null,
    );

    // --- Wizard 3 bước: Self-assessment → Assessment → Teachers --------------
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [tab, setTab] = useState<"quiz" | "writing">("quiz");
    const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
    const [quizIndex, setQuizIndex] = useState(0);
    // Matching tự chạy tối đa 1 lần cho mỗi lần có bằng chứng mới (không loop).
    const autoMatched = useRef(false);

    const analyze = useAnalyzeWriting();
    const latest = useLatestAssessment();
    const profile = useLearnerProfile();
    const match = useMatchFromProfile();

    const shownAssessment = assessment ?? latest.data ?? null;
    const textError =
        text.length > 0 && text.trim().length < MIN_TEXT_LENGTH
            ? format(t("match.s1.minError"), { n: MIN_TEXT_LENGTH })
            : text.length > MAX_TEXT_LENGTH
              ? format(t("match.s1.maxError"), { n: MAX_TEXT_LENGTH })
              : undefined;

    const learnerProfile = profile.data ?? null;
    const canFind = !!learnerProfile?.skills.some(
        (s) => s.status === "assessed",
    );

    const busy = analyze.isPending || match.isPending;
    // Bước 3: tự tìm giảng viên một lần khi đã có bằng chứng dùng được.
    useEffect(() => {
        if (step !== 3 || !canFind || autoMatched.current) return;
        autoMatched.current = true;
        match.mutate({ requireLevelMatch });
    }, [step, canFind, match, requireLevelMatch]);

    const handleFind = () => {
        if (!canFind || match.isPending) return;
        match.mutate({ requireLevelMatch });
    };

    const handleAnalyze = async () => {
        if (textError || !text.trim() || analyze.isPending) return;
        try {
            const data = await analyze.mutateAsync(text.trim());
            setAssessment(data);
            // Bằng chứng mới → cho phép auto-match chạy lại ở Bước 3.
            autoMatched.current = false;
            setStep(3);
        } catch {
            /* errors surfaced via mutation state */
        }
    };

    const handleQuizDone = () => {
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
                                        aria-current={
                                            active ? "step" : undefined
                                        }
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold border transition-colors cursor-pointer ${
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
                                    {wizardStep.n < 3 && (
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
                            onContinue={() => setStep(2)}
                        />
                    </section>
                )}

                {/* BƯỚC 2 — ASSESSMENT (quiz từ vựng | writing — giữ nguyên) */}
                {step === 2 && (
                    <section className="w-full bg-card rounded-lg p-5 lg:p-6 shadow-sm border border-border">
                        <SectionHeader
                            area={t("match.quiz.area")}
                            title={t("match.quiz.title")}
                            subtitle={t("match.quiz.subtitle")}
                        />

                        {/* Chọn path: Quiz (mặc định) | Writing (phân tích như cũ) */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            <button
                                type="button"
                                onClick={() => setTab("quiz")}
                                aria-pressed={tab === "quiz"}
                                className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-colors cursor-pointer ${
                                    tab === "quiz"
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card text-muted-foreground border-border hover:border-input"
                                }`}
                            >
                                {t("match.quiz.tabQuiz")}
                            </button>
                            <button
                                type="button"
                                onClick={() => setTab("writing")}
                                aria-pressed={tab === "writing"}
                                className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-colors cursor-pointer ${
                                    tab === "writing"
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card text-muted-foreground border-border hover:border-input"
                                }`}
                            >
                                {t("match.quiz.tabWriting")}
                            </button>
                        </div>

                        {tab === "quiz" ? (
                            <QuizPanel
                                answers={quizAnswers}
                                onAnswersChange={setQuizAnswers}
                                index={quizIndex}
                                onIndexChange={setQuizIndex}
                                onDone={handleQuizDone}
                            />
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

                                {/* CTA — phân tích writing rồi sang Bước 3 (tự match) */}
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
                                    {shownAssessment && (
                                        <Button
                                            variant="outline"
                                            className="w-full sm:w-auto h-auto px-5 py-3.5 font-semibold text-base rounded-full cursor-pointer"
                                            disabled={busy}
                                            onClick={() => setStep(3)}
                                        >
                                            {t("match.wizard.next")}
                                        </Button>
                                    )}
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
                                {latest.isLoading && !assessment && (
                                    <Skeleton className="h-16 rounded-xl" />
                                )}
                                {!shownAssessment &&
                                    latest.isError &&
                                    !latest.isLoading && (
                                        <p className="text-sm text-destructive font-medium">
                                            {t("match.s1.latestError")}
                                        </p>
                                    )}
                                {!shownAssessment &&
                                    latest.data === null &&
                                    !latest.isLoading &&
                                    !latest.isError && (
                                        <p className="text-sm text-muted-foreground">
                                            {t("match.s1.noAssessment")}
                                        </p>
                                    )}
                            </div>
                        )}

                        {/* Điều hướng bước */}
                        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-border">
                            <Button
                                variant="outline"
                                className="rounded-full font-semibold cursor-pointer"
                                onClick={() => setStep(1)}
                            >
                                {t("match.wizard.back")}
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-full font-semibold cursor-pointer"
                                onClick={() => setStep(3)}
                            >
                                {t("match.wizard.next")}
                            </Button>
                        </div>
                    </section>
                )}

                {/* BƯỚC 3 — HỒ SƠ & MATCHING */}
                {step === 3 && (
                    <>
                        {/* Kết quả bài viết — hiển thị trước hồ sơ để giữ đúng thứ tự Khu vực 02 → 03. */}
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
                            />
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

                        {/* 03 TEACHER MATCHES */}
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

                {/* 04 MANUAL (secondary) */}
                <section className="w-full border-t border-border pt-8">
                    <SectionHeader
                        area={t("match.manual.sectionArea")}
                        title={t("match.manual.sectionTitle")}
                        subtitle={t("match.manual.sectionSub")}
                    />
                    <ManualSection />
                </section>
            </div>
        </div>
    );
}
