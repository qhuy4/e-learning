import { Button } from "@fe/components/ui/button";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";

interface BookingSubmitSectionProps {
    isError: boolean;
    isPending: boolean;
    disabled: boolean;
    amount: number;
    userEmail?: string;
    onConfirm: () => void;
}

export function BookingSubmitSection({
    isError,
    isPending,
    disabled,
    amount,
    userEmail,
    onConfirm,
}: BookingSubmitSectionProps) {
    return (
        <div className="flex flex-col gap-3 pt-2">
            {isError && (
                <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                    Không thể tạo thanh toán cho khung giờ này. Vui lòng chọn
                    ngày hoặc giờ khác rồi thử lại.
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
                    <CreditCard className="size-5" />
                )}
                <span>
                    {isPending
                        ? "Đang chuyển đến VNPay..."
                        : amount > 0
                            ? `Thanh toán ${new Intl.NumberFormat("vi-VN").format(amount)} ₫`
                            : "Giảng viên chưa mở lịch trả phí"}
                </span>
            </Button>

            <div className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-secondary shrink-0" />
                <span>
                    Thanh toán bảo mật qua VNPay. Lịch và phòng học sẽ được xác
                    nhận ngay sau khi thanh toán thành công; thông tin gửi tới{" "}
                    <strong>{userEmail || "email của bạn"}</strong>.
                </span>
            </div>
        </div>
    );
}
