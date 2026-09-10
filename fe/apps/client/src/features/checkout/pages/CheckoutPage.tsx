import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { checkoutService } from "../services/checkout.service";
import { OrderSummary } from "../components/OrderSummary";
import { PaymentMethodSelect } from "../components/PaymentMethodSelect";

export const CheckoutPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [gateway, setGateway] = useState("VNPAY");

  const { data: course, isLoading } = useQuery({
    queryKey: ["checkout-course", slug],
    queryFn: () => checkoutService.getCourseBySlug(slug!),
    enabled: !!slug,
  });

  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!course) throw new Error("Course not loaded");

      const order = await checkoutService.createOrder({
        items: [
          {
            courseId: Number(course.id),
            instructorId: Number(course.instructorId),
            unitPrice: course.price,
            finalPrice: course.price,
          },
        ],
      });

      const payment = await checkoutService.createPayment({
        orderId: Number(order.id),
        gateway,
        amount: course.price,
        currency: "VND",
        description: `Thanh toan khoa hoc: ${course.title}`,
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

  const freeEnrollMutation = useMutation({
    mutationFn: () =>
      checkoutService.enrollFreeCourse(
        Number(course?.id),
        Number(course?.instructorId),
      ),
    onSuccess: () => {
      navigate(`/payment/result?status=success`);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-slate-500">Khóa học không tồn tại.</p>
      </div>
    );
  }

  const isFree = course.price === 0;

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
          <OrderSummary course={course} />

          {!isFree && (
            <PaymentMethodSelect value={gateway} onChange={setGateway} />
          )}

          {orderMutation.isError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              Có lỗi xảy ra. Vui lòng thử lại.
            </div>
          )}

          {freeEnrollMutation.isError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              Đăng ký thất bại. Vui lòng thử lại.
            </div>
          )}

          {isFree ? (
            <Button
              onClick={() => freeEnrollMutation.mutate()}
              disabled={freeEnrollMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-base font-semibold"
            >
              {freeEnrollMutation.isPending ? (
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
