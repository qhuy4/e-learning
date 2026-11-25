import { useEffect, useState } from "react";
import { RotateCcw, Square, Volume2 } from "lucide-react";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { Skeleton } from "@fe/components/ui/skeleton";
import { AudioPlayer } from "@/features/ielts/components/listening/AudioPlayer";
import { ErrorBanner } from "@/features/matching/components/error-banner";
import { format } from "@/features/matching/config/matching.config";
import {
    useLatestListening,
    useListeningForm,
    useScoreListening,
} from "@/features/matching/hooks/use-matching";
import { apiErrorMessage } from "@/features/matching/lib/api-error";
import type { ListeningAttempt } from "@/features/matching/types/matching.type";
import { useI18n } from "@/i18n/use-i18n";

function SpeechPlayer({
    text,
    level,
    title,
}: {
    text: string;
    level: string;
    title: string;
}) {
    const { t } = useI18n();
    const [speaking, setSpeaking] = useState(false);
    const supported =
        typeof window !== "undefined" && "speechSynthesis" in window;

    useEffect(
        () => () => {
            if (supported) window.speechSynthesis.cancel();
        },
        [supported],
    );

    if (!supported) return null;

    const play = () => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = ["pre-A1", "A1"].includes(level) ? 0.72 : 0.88;
        const voice = window.speechSynthesis
            .getVoices()
            .find((item) => item.lang.startsWith("en"));
        if (voice) utterance.voice = voice;
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        setSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <div>
                <p className="font-bold text-foreground">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {t("match.listening.voiceHint")}
                </p>
            </div>
            <Button
                type="button"
                variant="outline"
                className="rounded-full font-semibold"
                onClick={() => {
                    if (speaking) {
                        window.speechSynthesis.cancel();
                        setSpeaking(false);
                    } else {
                        play();
                    }
                }}
            >
                {speaking ? <Square size={16} /> : <Volume2 size={17} />}
                {t(
                    speaking
                        ? "match.listening.stopVoice"
                        : "match.listening.playVoice",
                )}
            </Button>
        </div>
    );
}

export function ListeningPanel({
    onDone,
    onSkip,
}: {
    onDone: (attempt: ListeningAttempt) => void;
    onSkip: () => void;
}) {
    const { t } = useI18n();
    const form = useListeningForm();
    const latest = useLatestListening();
    const score = useScoreListening();
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [result, setResult] = useState<ListeningAttempt | null>(null);
    const [ignoreLatest, setIgnoreLatest] = useState(false);

    const shownResult =
        result ??
        (!ignoreLatest && Object.keys(answers).length === 0
            ? (latest.data ?? null)
            : null);
    const items = form.data?.groups.flatMap((group) => group.items) ?? [];
    const complete =
        items.length > 0 && Object.keys(answers).length === items.length;
    const error = apiErrorMessage(form.error) ?? apiErrorMessage(score.error);

    if (shownResult) {
        return (
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-foreground">
                        {t("match.listening.result")}
                    </h3>
                    <Badge
                        variant="outline"
                        className="rounded-full border-primary/40 bg-primary/10"
                    >
                        {shownResult.level ? `${shownResult.level} · ` : ""}
                        {shownResult.scorePct}%
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    {format(t("match.listening.score"), {
                        n: shownResult.rawScore,
                        m: shownResult.total,
                    })}
                </p>
                <div className="flex flex-wrap gap-3">
                    <Button
                        className="rounded-full font-bold"
                        onClick={() => onDone(shownResult)}
                    >
                        {t("match.wizard.next")}
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-full font-semibold"
                        onClick={() => {
                            setResult(null);
                            setIgnoreLatest(true);
                            setAnswers({});
                            score.reset();
                            void form.refetch();
                        }}
                    >
                        <RotateCcw size={16} />
                        {t("match.listening.retake")}
                    </Button>
                </div>
            </div>
        );
    }

    if (form.isLoading) return <Skeleton className="h-72 rounded-xl" />;
    if (form.isError || !form.data) {
        return (
            <ErrorBanner
                message={error ?? t("match.listening.loadError")}
                onRetry={() => void form.refetch()}
            />
        );
    }

    const submit = async () => {
        if (!complete || score.isPending) return;
        try {
            const attempt = await score.mutateAsync({
                version: form.data.version,
                responses: Object.entries(answers).map(
                    ([itemId, optionIndex]) => ({
                        itemId,
                        optionIndex,
                    }),
                ),
            });
            setResult(attempt);
        } catch {
            // Mutation error is rendered below.
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <p className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                {form.data.instructions}
            </p>
            <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                        {t("match.listening.level")} {form.data.level}
                    </Badge>
                    <span className="font-semibold text-foreground">
                        {form.data.source.title}
                    </span>
                </div>
                <p className="mt-2 text-muted-foreground">
                    {t("match.listening.source")}: {form.data.source.author}.{" "}
                    {t("match.listening.original")}
                </p>
                <p className="mt-1 text-muted-foreground">
                    {t("match.listening.framework")}:{" "}
                    <a
                        className="font-semibold text-primary underline-offset-4 hover:underline"
                        href={form.data.source.frameworkUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {form.data.source.frameworkTitle}
                    </a>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {t("match.listening.calibration")}
                </p>
            </div>
            {form.data.groups.map((group, groupIndex) => (
                <section key={group.groupId} className="flex flex-col gap-4">
                    <SpeechPlayer
                        title={group.title}
                        text={group.speechText}
                        level={form.data.level}
                    />
                    {group.audioUrl &&
                        typeof window !== "undefined" &&
                        !("speechSynthesis" in window) && (
                            <AudioPlayer
                                title={group.title}
                                label={`Audio ${groupIndex + 1}`}
                                src={group.audioUrl}
                            />
                        )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {group.items.map((item, itemIndex) => (
                            <div
                                key={item.itemId}
                                className="rounded-xl border border-border bg-card p-4"
                            >
                                <p className="font-semibold text-foreground">
                                    {form.data.groups
                                        .slice(0, groupIndex)
                                        .reduce(
                                            (sum, current) =>
                                                sum + current.items.length,
                                            0,
                                        ) +
                                        itemIndex +
                                        1}
                                    . {item.question}
                                </p>
                                <div className="mt-3 flex flex-col gap-2">
                                    {item.options.map((option, optionIndex) => {
                                        const selected =
                                            answers[item.itemId] ===
                                            optionIndex;
                                        return (
                                            <button
                                                key={option}
                                                type="button"
                                                aria-pressed={selected}
                                                onClick={() =>
                                                    setAnswers((current) => ({
                                                        ...current,
                                                        [item.itemId]:
                                                            optionIndex,
                                                    }))
                                                }
                                                className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                                                    selected
                                                        ? "border-primary bg-primary/10 text-foreground"
                                                        : "border-border bg-muted text-muted-foreground hover:border-input"
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            <div className="flex flex-wrap gap-3 border-t border-border pt-4">
                <Button
                    className="rounded-full font-bold"
                    disabled={!complete || score.isPending}
                    onClick={() => void submit()}
                >
                    {score.isPending
                        ? t("match.listening.scoring")
                        : t("match.listening.submit")}
                </Button>
                <Button
                    variant="outline"
                    className="rounded-full font-semibold"
                    onClick={onSkip}
                >
                    {t("match.listening.skip")}
                </Button>
            </div>
        </div>
    );
}
