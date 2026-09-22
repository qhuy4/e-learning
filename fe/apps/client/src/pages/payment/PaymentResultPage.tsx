import { useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { CheckCircle, XCircle, Home, BookOpen } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useCart } from "@/features/cart/hooks/use-cart";

export const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

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

  useEffect(() => {
    if (isSuccess) clearCart();
  }, [clearCart, isSuccess]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            isSuccess ? "bg-emerald-100" : "bg-red-100"
          }`}
        >
          {isSuccess ? (
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          ) : (
            <XCircle className="w-10 h-10 text-red-500" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
        </h1>

        <p className="text-slate-500 mb-2">
          {isSuccess
            ? "Khóa học đã được thêm vào tài khoản của bạn."
            : "Có lỗi xảy ra trong quá trình thanh toán."}
        </p>

        {displayOrderId && (
          <p className="text-sm text-slate-400 mb-2">
            Mã đơn hàng: #{displayOrderId}
          </p>
        )}

        {displayAmount && (
          <p className="text-sm text-slate-400 mb-8">
            Số tiền: {displayAmount.toLocaleString("vi-VN")} ₫
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-slate-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>
          {isSuccess && (
            <Link to="/my-courses">
              <Button className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white">
                <BookOpen className="w-4 h-4 mr-2" />
                Khóa học của tôi
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
