import { Button } from "@fe/components/ui/button";
import { Calendar as CalendarIcon, Loader2, ShieldCheck } from "lucide-react";

interface BookingSubmitSectionProps {
    isError: boolean;
    isPending: boolean;
    disabled: boolean;
    userEmail?: string;
    onConfirm: () => void;
}

export function BookingSubmitSection({
    isError,
    isPending,
    disabled,
    userEmail,
    onConfirm,
}: BookingSubmitSectionProps) {
    return (
        <div className="flex flex-col gap-3 pt-2">
            {isError && (
                <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                    We couldn't book that time slot. Please choose another date or
                    time.
                </p>
            )}

            <Button
                disabled={disabled}
                onClick={onConfirm}
                className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-extrabold transition-all flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <Loader2 className="size-5 animate-spin" />
                ) : (
                    <CalendarIcon className="size-5" />
                )}
                <span>
                    {isPending
                        ? "Confirming Session..."
                        : "Confirm Free Discovery Session"}
                </span>
            </Button>

            <div className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-secondary shrink-0" />
                <span>
                    Instant confirmation sent to{" "}
                    <strong>{userEmail || "your email"}</strong>. Free cancellation
                    or reschedule up to 2 hours prior.
                </span>
            </div>
        </div>
    );
}
