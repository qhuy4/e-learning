import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BadgePercent,
  CheckCircle2,
  Loader2,
  Tag,
  TicketPercent,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@fe/components/ui/dialog";
import {
  checkoutService,
  getApiErrorMessage,
  type CouponValidationResult,
} from "../services/checkout.service";

interface VoucherSelectProps {
  courseId: number;
  /** Giá trị đơn hàng (giá khóa học) để kiểm tra hạn mức tối thiểu. */
  amount: number;
  selected: CouponValidationResult | null;
  onSelect: (coupon: CouponValidationResult | null) => void;
}

const discountLabel = (c: {
  discountType: string;
  discountValue: number;
  maxDiscountAmount: number | null;
}) => {
  const base =
    c.discountType === "1"
      ? `Giảm ${Number(c.discountValue)}%`
      : `Giảm ${Number(c.discountValue).toLocaleString("vi-VN")} ₫`;
  return c.maxDiscountAmount != null
    ? `${base} (tối đa ${Number(c.maxDiscountAmount).toLocaleString("vi-VN")} ₫)`
    : base;
};

export const VoucherSelect = ({
  courseId,
  amount,
  selected,
  onSelect,
}: VoucherSelectProps) => {
  const [open, setOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["checkout-coupons", courseId],
    queryFn: () => checkoutService.getActiveCoupons(courseId),
    enabled: !!courseId && amount > 0,
  });

  const validateMutation = useMutation({
    mutationFn: (payload: { code?: string; couponId?: number }) =>
      checkoutService.validateCoupon({
        ...payload,
        courseId,
        amount,
      }),
    onSuccess: (result) => {
      setError(null);
      setCodeInput("");
      setOpen(false);
      onSelect(result);
    },
    onError: (e) => setError(getApiErrorMessage(e, "Mã giảm giá không hợp lệ")),
  });

  const handlePick = (couponId: number) => {
    if (validateMutation.isPending) return;
    // Đang mở modal & bấm đúng mã đang chọn → giữ nguyên, đóng modal
    if (selected?.id === couponId) {
      if (open) {
        setOpen(false);
        return;
      }
      onSelect(null);
      setError(null);
      return;
    }
    validateMutation.mutate({ couponId });
  };

  const handleApplyCode = () => {
    const code = codeInput.trim();
    if (!code) {
      setError("Vui lòng nhập mã giảm giá");
      return;
    }
    validateMutation.mutate({ code });
  };

  return (
    <div>
      {/* Một dòng gọn: tiêu đề + trạng thái mã / nút mở modal */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-base font-bold text-slate-900">
          <TicketPercent className="h-4 w-4 text-piemind-pink" />
          Mã giảm giá
        </span>

        {selected ? (
          <div className="flex min-w-0 items-center gap-2 rounded-full border border-piemind-pink/30 bg-piemind-pink/10 py-1.5 pl-3 pr-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-piemind-pink" />
            <span className="max-w-24 truncate font-mono text-xs font-bold text-slate-900 sm:max-w-none">
              {selected.code}
            </span>
            <span className="shrink-0 text-xs font-bold text-piemind-pink">
              −{Number(selected.discountAmount).toLocaleString("vi-VN")} ₫
            </span>
            <button
              type="button"
              onClick={() => {
              setError(null);
              setOpen(true);
            }}
              className="shrink-0 cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-piemind-pink"
            >
              Đổi mã
            </button>
            <button
              type="button"
              aria-label="Xóa mã giảm giá"
              onClick={() => {
                onSelect(null);
                setError(null);
              }}
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-rose-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setOpen(true);
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-piemind-pink transition hover:border-piemind-pink/50 hover:bg-piemind-pink/[0.04]"
          >
            <Tag className="h-4 w-4" />
            Áp dụng mã
          </button>
        )}
      </div>

      {/* Modal chọn mã giảm giá */}
      <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-8 font-bold">
              <TicketPercent className="h-4 w-4 text-piemind-pink" />
              Chọn mã giảm giá
            </DialogTitle>
            <DialogDescription>
              Chọn một mã có sẵn hoặc nhập mã bạn có để áp dụng cho đơn hàng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Danh sách mã khả dụng */}
            {isLoading ? (
              <div className="flex items-center gap-2 py-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải mã giảm giá...
              </div>
            ) : coupons.length > 0 ? (
              <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
                {coupons.map((coupon) => (
                  <button
                    key={coupon.id}
                    type="button"
                    onClick={() => handlePick(coupon.id)}
                    disabled={validateMutation.isPending}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all disabled:opacity-60 ${
                      selected?.id === coupon.id
                        ? "border-piemind-pink bg-piemind-pink/[0.04]"
                        : "border-dashed border-slate-200 hover:border-piemind-pink/50 hover:bg-piemind-pink/[0.04]"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-piemind-pink/10 text-piemind-pink">
                      <BadgePercent className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[13px] font-bold text-slate-900">
                        {coupon.code}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {coupon.description || discountLabel(coupon)}
                        {coupon.validUntil &&
                          ` · HSD ${new Date(
                            coupon.validUntil,
                          ).toLocaleDateString("vi-VN")}`}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-bold text-piemind-pink">
                      {discountLabel(coupon)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-2 text-center text-sm text-slate-400">
                Hiện chưa có mã giảm giá khả dụng cho khóa học này.
              </p>
            )}

            {/* Nhập tay */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCode()}
                  placeholder="Nhập mã giảm giá"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold uppercase tracking-wide text-slate-900 outline-none transition focus:border-piemind-pink focus:ring-2 focus:ring-piemind-pink/25"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCode}
                disabled={validateMutation.isPending}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-900 px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white disabled:opacity-60"
              >
                {validateMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Áp dụng
              </button>
            </div>

            {error && (
              <p className="text-sm font-medium text-rose-600">{error}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
