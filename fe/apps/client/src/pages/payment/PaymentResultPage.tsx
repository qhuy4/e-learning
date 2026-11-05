import { useSearchParams, Link } from "react-router";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RefreshCcw,
  GraduationCap,
  Home,
  BookOpen,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { formatCurrency } from "@fe/lib/utils";

interface LastCheckout {
  slug?: string | null;
  title?: string | null;
}

export const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");
  const vnpResponseCode = searchParams.get("vnp_ResponseCode");
  const vnpTxnRef = searchParams.get("vnp_TxnRef");
  const vnpAmount = searchParams.get("vnp_Amount");
  const vnpTransactionStatus = searchParams.get("vnp_TransactionStatus");

  const isSuccess =
    status === "success" || status === "3" || vnpResponseCode === "00" || vnpTransactionStatus === "00";

  const displayOrderId = orderId || vnpTxnRef;
  const displayAmount = vnpAmount ? Number(vnpAmount) / 100 : null;

  // Khóa học đang thanh toán (CheckoutPage ghi lại khi tạo đơn — chỉ dùng cho hiển thị)
  let lastCheckout: LastCheckout | null = null;
  try {
    const raw = sessionStorage.getItem("piemind:lastCheckout");
    if (raw) lastCheckout = JSON.parse(raw) as LastCheckout;
  } catch {
    lastCheckout = null;
  }

  const courseSlug = lastCheckout?.slug || null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-background px-4 py-12">
      <div className="w-full max-w-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
        {/* Card trung tâm */}
        <div className="rounded-2xl border border-border bg-card p-7 text-center shadow-[0_4px_20px_rgba(15,23,42,0.06)] sm:p-10">
          {/* Icon trạng thái */}
          <div
            className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full animate-in fade-in-0 zoom-in-95 duration-500 ${
              isSuccess
                ? "bg-emerald-50 text-emerald-500 ring-4 ring-emerald-100"
                : "bg-amber-50 text-amber-500 ring-4 ring-amber-100"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-10 w-10" />
            ) : (
              <AlertTriangle className="h-10 w-10" />
            )}
          </div>

          {/* Tiêu đề + thông báo */}
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </h1>
          <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
            {isSuccess
              ? "Khóa học đã được thêm vào tài khoản của bạn. Bắt đầu học nào!"
              : "Giao dịch chưa hoàn tất. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác."}
          </p>

          {/* Thông tin đơn hàng */}
          {(displayOrderId || displayAmount || (isSuccess && lastCheckout?.title)) && (
            <div className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-muted text-left">
              {displayOrderId && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Mã đơn hàng</span>
                  <span className="font-mono font-bold text-foreground">
                    #{displayOrderId}
                  </span>
                </div>
              )}
              {displayAmount && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Số tiền</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(displayAmount)}
                  </span>
                </div>
              )}
              {isSuccess && lastCheckout?.title && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="shrink-0 text-muted-foreground">Khóa học</span>
                  <span className="line-clamp-1 font-semibold text-foreground">
                    {lastCheckout.title}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mã giao dịch gateway (khi thất bại) */}
          {!isSuccess && vnpResponseCode && vnpResponseCode !== "00" && (
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              Mã giao dịch: {vnpResponseCode}
            </p>
          )}

          {/* Hành động */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {isSuccess ? (
              <>
                {courseSlug && (
                  <Link to={`/learning/${courseSlug}`} className="flex-1">
                    <Button className="h-11 w-full rounded-xl text-sm font-semibold">
                      <GraduationCap className="size-4" />
                      Bắt đầu học
                    </Button>
                  </Link>
                )}
                <Link to="/my-courses" className="flex-1">
                  <Button
                    variant={courseSlug ? "outline" : undefined}
                    className="h-11 w-full rounded-xl text-sm font-semibold"
                  >
                    <BookOpen className="size-4" />
                    Khóa học của tôi
                  </Button>
                </Link>
              </>
            ) : courseSlug ? (
              <>
                <Link to={`/checkout/${courseSlug}`} className="flex-1">
                  <Button className="h-11 w-full rounded-xl text-sm font-semibold">
                    <RefreshCcw className="size-4" />
                    Thử thanh toán lại
                  </Button>
                </Link>
                <Link to={`/courses/${courseSlug}`} className="flex-1">
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-xl text-sm font-semibold"
                  >
                    <ArrowLeft className="size-4" />
                    Quay lại khóa học
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/" className="flex-1">
                <Button className="h-11 w-full rounded-xl text-sm font-semibold">
                  <Home className="size-4" />
                  Về trang chủ
                </Button>
              </Link>
            )}
          </div>

          {/* Link phụ */}
          {(isSuccess || courseSlug) && (
            <div className="mt-5">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-piemind-pink"
              >
                <Home className="w-3.5 h-3.5" />
                Về trang chủ
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
