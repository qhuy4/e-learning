import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { Skeleton } from "@fe/components/ui/skeleton";
import { useI18n } from "@/i18n/use-i18n";
import { bandLabel, format } from "@/features/matching/config/matching.config";
import {
    useLatestQuiz,
    useQuizForm,
    useScoreQuiz,
} from "@/features/matching/hooks/use-matching";
import { ErrorBanner } from "@/features/matching/components/error-banner";
import { apiErrorMessage } from "@/features/matching/lib/api-error";
import type { QuizAttempt } from "@/features/matching/types/matching.type";

const QUICK_QUIZ_ITEMS = 15;

/**
 * Bước 2 — quiz nhanh 15 câu, lấy trải đều từ form 30 câu của model.
 * Trả lời từng câu, CHO PHÉP NỘP THIẾU (backend chấm phần đã trả lời).
 * `answers`/`index` nằm ở trang cha để giữ trạng thái khi qua lại các bước.
 */
export function QuizPanel({
    answers,
    onAnswersChange,
    index,
    onIndexChange,
    onDone,
}: {
    answers: Record<string, string>;
    onAnswersChange: (next: Record<string, string>) => void;
    index: number;
    onIndexChange: (next: number) => void;
    onDone: () => void;
}) {
    const { t } = useI18n();
    const form = useQuizForm();
    const score = useScoreQuiz();
    const latest = useLatestQuiz();
    /** Kết quả vừa chấm trong phiên này. */
    const [scored, setScored] = useState<QuizAttempt | null>(null);
    /** true = user bấm "Làm lại" — không hiển thị lại bài cũ. */
    const [dismissedLatest, setDismissedLatest] = useState(false);

    // Form gốc có 5 câu/band. Lấy xen kẽ giữ đủ A1–C2 và vẫn đạt ngưỡng
    // 15 câu mà backend cần để chốt band.
    const items = (form.data?.items ?? [])
        .filter((_, itemIndex) => itemIndex % 2 === 0)
        .slice(0, QUICK_QUIZ_ITEMS);
    const total = items.length;
    const safeIndex = Math.min(Math.max(index, 0), Math.max(total - 1, 0));
    const item = items[safeIndex];
    const answered = Object.keys(answers).length;
    const error = apiErrorMessage(form.error) ?? apiErrorMessage(score.error);

    // Chưa chấm trong phiên + chưa trả lời câu nào → hiển thị bài gần nhất
    // (GET quiz/latest) thay vì mở form trống sau khi reload.
    const result =
        scored ??
        (!dismissedLatest && answered === 0 ? (latest.data ?? null) : null);
    const isPrevious = result !== null && scored === null;

    const handleSelect = (option: string) => {
        if (!item) return;
        onAnswersChange({ ...answers, [item.itemId]: option });
    };

    const handleSubmit = async () => {
        if (!form.data || answered < total || score.isPending) return;
        try {
            const attempt = await score.mutateAsync({
                form_seed: form.data.formSeed,
                responses: Object.entries(answers).map(([item_id, answer]) => ({
                    item_id,
                    answer,
                })),
            });
            setScored(attempt);
        } catch {
            /* lỗi hiển thị qua score.error */
        }
    };

    const handleRetake = () => {
        setScored(null);
        setDismissedLatest(true);
        onAnswersChange({});
        onIndexChange(0);
        score.reset();
    };

    // --- kết quả đã chấm ------------------------------------------------------
    if (result) {
        const partial = result.total < total;
        return (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        {isPrevious
                            ? t("match.quiz.lastAttempt")
                            : t("match.quiz.resultTitle")}
                    </span>
                    <Badge
                        variant="outline"
                        className={`rounded-full text-xs ${
                            result.provisional
                                ? "bg-accent/20 text-foreground border-accent/60"
                                : "bg-secondary/15 text-foreground border-secondary/50"
                        }`}
                    >
                        {result.provisional
                            ? t("match.quiz.provisional")
                            : t("match.quiz.calibrated")}
                    </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-2xl font-extrabold text-foreground">
                        {format(t("match.quiz.score"), {
                            n: result.rawScore,
                            m: result.total,
                        })}
                    </span>
                    {result.band && (
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            {t("match.quiz.band")}:
                            <strong className="text-foreground">
                                {bandLabel(result.band, t)}
                            </strong>
                        </span>
                    )}
                </div>

                {result.band && (
                    <div className="rounded-lg border border-border bg-muted p-3">
                        <p className="text-sm font-bold text-foreground">
                            {format(t("match.quiz.abilitySummary"), {
                                band: bandLabel(result.band, t),
                            })}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground dark:text-slate-300">
                            {result.provisional
                                ? t("match.quiz.abilityProvisional")
                                : format(
                                      t("match.quiz.calibratedExplanation"),
                                      {
                                          score: result.rawScore,
                                          total: result.total,
                                          band: bandLabel(result.band, t),
                                      },
                                  )}
                        </p>
                    </div>
                )}

                {result.perBand.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                            {t("match.quiz.perBand")}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {result.perBand.map((row) => (
                                <Badge
                                    key={row.band}
                                    variant="outline"
                                    className="rounded-full text-xs border-border text-muted-foreground dark:text-slate-300"
                                >
                                    {bandLabel(row.band, t)} {row.correct}/
                                    {row.total}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {total > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {partial
                            ? format(t("match.quiz.partialNote"), {
                                  n: result.total,
                                  m: total,
                              })
                            : format(t("match.quiz.fullNote"), {
                                  m: result.total,
                              })}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer"
                        onClick={onDone}
                    >
                        {t("match.quiz.toProfile")}
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-full font-semibold cursor-pointer"
                        onClick={handleRetake}
                    >
                        <RotateCcw size={16} />
                        {t("match.quiz.retake")}
                    </Button>
                </div>
            </div>
        );
    }

    // --- đang tải / lỗi -------------------------------------------------------
    if (form.isLoading) {
        return (
            <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                    {t("match.quiz.loading")}
                </p>
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-40 rounded-xl" />
            </div>
        );
    }

    if (form.isError || !form.data || !item) {
        return (
            <ErrorBanner
                message={error ?? t("match.quiz.loadError")}
                onRetry={() => void form.refetch()}
            />
        );
    }

    // --- làm bài --------------------------------------------------------------
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h3 className="font-bold text-foreground">
                    {t("match.quiz.quizTitle")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground dark:text-slate-300">
                    {t("match.quiz.quizSubtitle")}
                </p>
            </div>
            <div className="rounded-xl border border-border bg-muted px-4 py-3 text-xs text-muted-foreground">
                {form.data.instructions}
            </div>

            {/* Tiến độ */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-foreground">
                        {format(t("match.quiz.questionOf"), {
                            n: safeIndex + 1,
                            m: total,
                        })}
                    </span>
                    <span className="text-muted-foreground">
                        {format(t("match.quiz.progress"), {
                            n: answered,
                            m: total,
                        })}
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full bg-secondary transition-all duration-300"
                        style={{
                            width: `${total > 0 ? (answered / total) * 100 : 0}%`,
                        }}
                    />
                </div>
            </div>

            {/* Câu hỏi */}
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
                <p className="text-base font-semibold text-foreground leading-relaxed">
                    {item.question}
                </p>
                <div className="flex flex-col gap-2">
                    {item.options.map((option) => {
                        const selected = answers[item.itemId] === option;
                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleSelect(option)}
                                aria-pressed={selected}
                                className={`px-4 py-2.5 rounded-full border text-left text-sm font-semibold transition-colors cursor-pointer ${
                                    selected
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-muted text-foreground border-border hover:border-input"
                                }`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>

            {error && score.isError && (
                <p className="text-sm text-destructive font-medium">{error}</p>
            )}

            {/* Điều hướng */}
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    variant="outline"
                    className="rounded-full font-semibold cursor-pointer"
                    disabled={safeIndex === 0}
                    onClick={() => onIndexChange(safeIndex - 1)}
                >
                    <ChevronLeft size={16} />
                    {t("match.quiz.prev")}
                </Button>
                <Button
                    variant="outline"
                    className="rounded-full font-semibold cursor-pointer"
                    disabled={safeIndex >= total - 1}
                    onClick={() => onIndexChange(safeIndex + 1)}
                >
                    {t("match.quiz.next")}
                    <ChevronRight size={16} />
                </Button>
                <Button
                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer sm:ml-auto"
                    disabled={answered < total || score.isPending}
                    onClick={handleSubmit}
                >
                    {score.isPending
                        ? t("match.quiz.submitting")
                        : t("match.quiz.submit")}
                </Button>
            </div>

            {answered < total && (
                <p className="text-xs text-muted-foreground">
                    {t("match.quiz.empty")}
                </p>
            )}
        </div>
    );
}
