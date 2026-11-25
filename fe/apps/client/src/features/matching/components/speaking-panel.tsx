import { useEffect, useState } from "react";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { Skeleton } from "@fe/components/ui/skeleton";
import { AudioReplay } from "@/features/exams/components/AudioReplay";
import { SpeakingRecorder } from "@/features/ielts/components/speaking/SpeakingRecorder";
import { ErrorBanner } from "@/features/matching/components/error-banner";
import {
    useLatestSpeaking,
    useRetrySpeaking,
    useSpeakingPrompt,
    useSubmitSpeaking,
} from "@/features/matching/hooks/use-matching";
import { apiErrorMessage } from "@/features/matching/lib/api-error";
import { format } from "@/features/matching/config/matching.config";
import type { SpeakingAttempt } from "@/features/matching/types/matching.type";
import { useI18n } from "@/i18n/use-i18n";

export function SpeakingPanel({
    onDone,
    onSkip,
    allowSkip,
}: {
    onDone: (attempt: SpeakingAttempt) => void;
    onSkip: () => void;
    allowSkip: boolean;
}) {
    const { t } = useI18n();
    const prompt = useSpeakingPrompt();
    const latest = useLatestSpeaking();
    const submit = useSubmitSpeaking();
    const retry = useRetrySpeaking();
    const [recording, setRecording] = useState<{
        url: string;
        seconds: number;
        blob: Blob;
    } | null>(null);
    const [result, setResult] = useState<SpeakingAttempt | null>(null);
    const [ignoreLatest, setIgnoreLatest] = useState(false);

    useEffect(
        () => () => {
            if (recording?.url) URL.revokeObjectURL(recording.url);
        },
        [recording?.url],
    );

    const latestResult = !ignoreLatest ? latest.data : null;
    const shownResult =
        latestResult && (!result || latestResult.attemptId === result.attemptId)
            ? latestResult
            : result;
    const error =
        apiErrorMessage(prompt.error) ??
        apiErrorMessage(latest.error) ??
        apiErrorMessage(submit.error) ??
        apiErrorMessage(retry.error);

    if (shownResult) {
        const transcribed = shownResult.transcriptionStatus === "COMPLETED";
        const assessed = shownResult.assessmentStatus === "COMPLETED";
        const failed =
            shownResult.transcriptionStatus === "FAILED" ||
            shownResult.assessmentStatus === "FAILED";
        const scoreCards = [
            {
                key: "grammar",
                label: t("match.speaking.grammar"),
                score: shownResult.grammarScore,
                feedback: shownResult.assessmentFeedback?.grammar,
            },
            {
                key: "vocabulary",
                label: t("match.speaking.vocabulary"),
                score: shownResult.vocabularyScore,
                feedback: shownResult.assessmentFeedback?.vocabulary,
            },
            {
                key: "fluency",
                label: t("match.speaking.fluency"),
                score: shownResult.fluencyScore,
                feedback: shownResult.assessmentFeedback?.fluency,
            },
        ];
        return (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-foreground">
                        {t("match.speaking.result")}
                    </h3>
                    <Badge
                        variant={
                            failed
                                ? "destructive"
                                : assessed
                                  ? "secondary"
                                  : "outline"
                        }
                    >
                        {failed
                            ? t("match.speaking.failed")
                            : assessed
                              ? t("match.speaking.assessed")
                              : t("match.speaking.analysisPending")}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    {shownResult.level} · {shownResult.durationSeconds}s
                </p>
                <AudioReplay src={shownResult.audioUrl} />
                {shownResult.transcript && (
                    <div className="rounded-lg border border-border bg-muted p-4">
                        <p className="text-xs font-bold uppercase text-muted-foreground">
                            {t("match.speaking.transcript")}
                        </p>
                        <p className="mt-2 text-sm text-foreground">
                            {shownResult.transcript}
                        </p>
                    </div>
                )}
                {assessed && (
                    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4">
                        <div className="flex flex-wrap items-end justify-between gap-2">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                    {t("match.speaking.mvpEstimate")}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t("match.speaking.estimateNote")}
                                </p>
                            </div>
                            <span className="text-3xl font-bold text-foreground">
                                {shownResult.overallScore}%
                            </span>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                            {scoreCards.map((item) => (
                                <div
                                    key={item.key}
                                    className="rounded-lg border border-border bg-card p-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-bold text-foreground">
                                            {item.label}
                                        </span>
                                        <span className="text-lg font-bold text-foreground">
                                            {item.score}%
                                        </span>
                                    </div>
                                    {item.feedback && (
                                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                            {item.feedback}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {format(t("match.speaking.fluencyMetrics"), {
                                words:
                                    shownResult.assessmentFeedback?.wordCount ??
                                    0,
                                wpm:
                                    shownResult.assessmentFeedback
                                        ?.wordsPerMinute ?? 0,
                            })}
                        </p>
                    </div>
                )}
                {transcribed && shownResult.assessmentStatus === "FAILED" && (
                    <p className="text-sm text-muted-foreground">
                        {t("match.speaking.analysisFailed")}
                    </p>
                )}
                {!failed && !assessed && (
                    <p className="text-sm text-muted-foreground">
                        {t("match.speaking.queuedNote")}
                    </p>
                )}
                {shownResult.transcriptionStatus === "FAILED" && (
                    <p className="text-sm text-muted-foreground">
                        {t("match.speaking.audioKept")}
                    </p>
                )}
                {error && (
                    <p className="text-sm font-medium text-destructive">
                        {error}
                    </p>
                )}
                <div className="flex flex-wrap gap-3">
                    <Button onClick={() => onDone(shownResult)}>
                        {t("match.wizard.next")}
                    </Button>
                    {shownResult.canRetry && (
                        <Button
                            variant="outline"
                            disabled={retry.isPending}
                            onClick={async () => {
                                try {
                                    const next = await retry.mutateAsync(
                                        shownResult.attemptId,
                                    );
                                    setResult(next);
                                } catch {
                                    // Mutation error is rendered above.
                                }
                            }}
                        >
                            {retry.isPending
                                ? t("match.speaking.processing")
                                : transcribed
                                  ? t("match.speaking.retryAnalysis")
                                  : t("match.speaking.retry")}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => {
                            setResult(null);
                            setIgnoreLatest(true);
                            setRecording(null);
                            void prompt.refetch();
                        }}
                    >
                        {t("match.speaking.retake")}
                    </Button>
                </div>
            </div>
        );
    }

    if (prompt.isLoading || latest.isLoading) {
        return <Skeleton className="h-80 rounded-xl" />;
    }
    if (!prompt.data) {
        return (
            <ErrorBanner
                message={error ?? t("match.speaking.loadError")}
                onRetry={() => void prompt.refetch()}
            />
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="rounded-xl border border-border bg-muted p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{prompt.data.level}</Badge>
                    <span className="font-bold text-foreground">
                        {prompt.data.title}
                    </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground">
                    {prompt.data.prompt}
                </p>
                {prompt.data.guided && (
                    <p className="mt-3 text-xs font-medium text-muted-foreground">
                        {t("match.speaking.guidedNote")}
                    </p>
                )}
            </div>

            <SpeakingRecorder
                durationSec={prompt.data.responseSeconds}
                prepSec={prompt.data.preparationSeconds}
                recorded={recording !== null}
                audioUrl={recording?.url}
                onStop={async (_note, seconds, audioUrl) => {
                    if (!audioUrl) {
                        setRecording(null);
                        return;
                    }
                    const blob = await fetch(audioUrl).then((res) =>
                        res.blob(),
                    );
                    setRecording({ url: audioUrl, seconds, blob });
                }}
                onReset={() => setRecording(null)}
            />

            {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            <div className="flex flex-wrap gap-3 border-t border-border pt-4">
                <Button
                    disabled={!recording || submit.isPending}
                    onClick={async () => {
                        if (!recording) return;
                        try {
                            const attempt = await submit.mutateAsync({
                                promptId: prompt.data.id,
                                durationSeconds: recording.seconds,
                                blob: recording.blob,
                            });
                            setIgnoreLatest(false);
                            setResult(attempt);
                        } catch {
                            // Mutation error is rendered above.
                        }
                    }}
                >
                    {submit.isPending
                        ? t("match.speaking.processing")
                        : t("match.speaking.submit")}
                </Button>
                {allowSkip && (
                    <Button variant="outline" onClick={onSkip}>
                        {t("match.speaking.skip")}
                    </Button>
                )}
            </div>
        </div>
    );
}
