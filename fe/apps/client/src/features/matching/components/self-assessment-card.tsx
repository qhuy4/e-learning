import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { useI18n } from "@/i18n/use-i18n";
import { bandLabel, format } from "@/features/matching/config/matching.config";
import { useSaveSelfAssessment } from "@/features/matching/hooks/use-matching";
import { apiErrorMessage } from "@/features/matching/lib/api-error";
import type { SelfAssessment } from "@/features/matching/types/matching.type";

/**
 * Bước 1 — sinh viên tự cảm nhận mức của mình.
 * Giá trị lưu qua POST /student-assessment/self-assessment; "auto" nghĩa là
 * để hệ thống tự chấm, KHÔNG khẳng định level.
 */
const OPTIONS = ["pre-A1", "A1", "A2", "B1", "B2", "C1", "C2", "auto"] as const;

export function SelfAssessmentCard({
    saved,
    onContinue,
}: {
    saved: SelfAssessment | null;
    onContinue: (band: string) => void;
}) {
    const { t } = useI18n();
    const save = useSaveSelfAssessment();

    // picked (chưa lưu) thắng giá trị đã lưu — user thấy đúng lựa chọn hiện tại.
    const [picked, setPicked] = useState<string | null>(null);
    const active = picked ?? saved?.band ?? null;

    const label = (band: string): string =>
        band === "auto"
            ? t("match.self.auto")
            : band === "pre-A1"
              ? t("match.self.preA1")
              : bandLabel(band, t);

    const handleSelect = async (band: string) => {
        if (save.isPending || band === active) return;
        setPicked(band);
        try {
            await save.mutateAsync(band);
        } catch {
            setPicked(saved?.band ?? null);
        }
    };

    const saveError = apiErrorMessage(save.error);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
                {OPTIONS.map((band) => (
                    <button
                        key={band}
                        type="button"
                        onClick={() => void handleSelect(band)}
                        disabled={save.isPending}
                        aria-pressed={active === band}
                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-70 ${
                            active === band
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-muted-foreground border-border hover:border-input"
                        }`}
                    >
                        {label(band)}
                    </button>
                ))}
            </div>

            <div className="rounded-xl border border-border bg-muted px-4 py-3">
                <p className="text-xs text-muted-foreground">
                    {saved
                        ? format(t("match.self.saved"), {
                              band: label(saved.band),
                          })
                        : t("match.self.hint")}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Button
                    variant="outline"
                    className="rounded-full font-semibold cursor-pointer"
                    disabled={save.isPending || !active}
                    onClick={() => active && onContinue(active)}
                >
                    {t("match.wizard.next")}
                </Button>
                {save.isPending && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground dark:text-slate-300">
                        <Loader2 size={14} className="animate-spin" />
                        {t("match.self.saving")}
                    </span>
                )}
            </div>

            {saveError && (
                <p className="text-sm text-destructive font-medium">
                    {saveError || t("match.self.error")}
                </p>
            )}

            {!saveError && save.data && !save.isPending && (
                <Badge
                    variant="outline"
                    className="self-start rounded-full border-secondary/50 bg-secondary/15 text-foreground"
                >
                    {format(t("match.self.saved"), {
                        band: label(save.data.band),
                    })}
                </Badge>
            )}
        </div>
    );
}
