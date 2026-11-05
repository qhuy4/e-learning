import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useI18n } from "@/i18n/use-i18n";

/** Banner lỗi dùng chung cho các khối kết quả (profile / matching / quiz). */
export function ErrorBanner({
    message,
    onRetry,
}: {
    message?: string;
    onRetry?: () => void;
}) {
    const { t } = useI18n();
    return (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
                <AlertCircle
                    size={16}
                    className="text-destructive mt-0.5 shrink-0"
                />
                <p className="text-sm text-destructive">
                    {message || t("match.error.generic")}
                </p>
            </div>
            {onRetry && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="rounded-full cursor-pointer shrink-0"
                >
                    <RefreshCw size={14} />
                    {t("match.error.retry")}
                </Button>
            )}
        </div>
    );
}
