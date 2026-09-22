import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { checkoutService } from "@/features/checkout/services/checkout.service";
import { OrderSummary } from "@/features/checkout/components/OrderSummary";
import { PaymentMethodSelect } from "@/features/checkout/components/PaymentMethodSelect";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCart } from "@/features/cart/hooks/use-cart";

export const CheckoutPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items } = useCart();
  const [gateway, setGateway] = useState("VNPAY");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/student/login");
    }
  }, [isAuthenticated, navigate]);

  const { data: course, isLoading } = useQuery({
    queryKey: ["checkout-course", slug],
    queryFn: () => checkoutService.getCourseBySlug(slug!),
    enabled: !!slug,
  });

  const orderMutation = useMutation({
    mutationFn: async () => {
      const checkoutItems = slug ? (course ? [course] : []) : items;
      if (!checkoutItems.length) throw new Error("Cart is empty");
      const total = checkoutItems.reduce((sum, item) => sum + Number(item.price), 0);

      const order = await checkoutService.createOrder({
        items: checkoutItems.map((item) => ({
          courseId: Number("courseId" in item ? item.courseId : item.id),
          instructorId: Number(item.instructorId),
          unitPrice: Number(item.price),
          finalPrice: Number(item.price),
        })),
      });

      if (total === 0) return { orderId: Number(order.id) };

      const payment = await checkoutService.createPayment({
        orderId: Number(order.id),
        gateway,
        amount: total,
        currency: "VND",
        description: "Thanh toan khoa hoc",
      });

      return payment;
    },
    onSuccess: (payment) => {
      if (payment.paymentUrl) {
        window.location.href = payment.paymentUrl;
      } else {
        navigate(`/payment/result?orderId=${payment.orderId}&status=success`);
      }
    },
  });

  if (slug && isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    );
  }

  const courses = slug ? (course ? [course] : []) : items;

  if (!courses.length) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-slate-500">Khóa học không tồn tại.</p>
      </div>
    );
  }

  const isFree = courses.every((item) => Number(item.price) === 0);
  const total = courses.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          {isFree ? "Đăng ký khóa học" : "Thanh toán"}
        </h1>

        <div className="space-y-6">
          <OrderSummary course={courses[0]} total={total} />

          {!isFree && (
            <PaymentMethodSelect value={gateway} onChange={setGateway} />
          )}

          {!isFree && orderMutation.isError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              Có lỗi xảy ra. Vui lòng thử lại.
            </div>
          )}

          {isFree && orderMutation.isError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              Đăng ký thất bại. Vui lòng thử lại.
            </div>
          )}

          {isFree ? (
            <Button
              onClick={() => orderMutation.mutate()}
              disabled={orderMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-base font-semibold"
            >
              {orderMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang đăng ký...
                </span>
              ) : (
                "Đăng ký miễn phí"
              )}
            </Button>
          ) : (
            <Button
              onClick={() => orderMutation.mutate()}
              disabled={orderMutation.isPending}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-6 text-base font-semibold"
            >
              {orderMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Thanh toán ngay
                </span>
              )}
            </Button>
          )}

          <p className="text-center text-xs text-slate-400">
            Bằng việc thanh toán, bạn đồng ý với điều khoản sử dụng của
            E-Learning
          </p>
        </div>
      </div>
    </div>
  );
};
