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
                    Không thể đặt khung giờ đó. Vui lòng chọn ngày hoặc giờ
                    khác.
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
                        ? "Đang xác nhận buổi học..."
                        : "Xác nhận buổi tư vấn miễn phí"}
                </span>
            </Button>

            <div className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-secondary shrink-0" />
                <span>
                    Xác nhận ngay sẽ được gửi tới{" "}
                    <strong>{userEmail || "email của bạn"}</strong>. Hủy hoặc đổi
                    lịch miễn phí trước buổi học ít nhất 2 giờ.
                </span>
            </div>
        </div>
    );
}
