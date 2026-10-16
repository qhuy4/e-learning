import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Lock, ArrowLeft, Star, Users } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import {
  checkoutService,
  getApiErrorMessage,
  type CouponValidationResult,
} from "@/features/checkout/services/checkout.service";
import { OrderSummary } from "@/features/checkout/components/OrderSummary";
import { PaymentMethodSelect } from "@/features/checkout/components/PaymentMethodSelect";
import { VoucherSelect } from "@/features/checkout/components/VoucherSelect";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { formatCurrency } from "@fe/lib/utils";

const levelLabels: Record<number, string> = {
  1: "Cơ bản",
  2: "Trung bình",
  3: "Nâng cao",
};

export const CheckoutPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [gateway, setGateway] = useState("VNPAY");
  const [appliedCoupon, setAppliedCoupon] =
    useState<CouponValidationResult | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/student/login");
    }
  }, [isAuthenticated, navigate]);

  // Đổi khóa học → bỏ mã giảm giá đã chọn
  useEffect(() => {
    setAppliedCoupon(null);
  }, [slug]);

  const { data: course, isLoading } = useQuery({
    queryKey: ["checkout-course", slug],
    queryFn: () => checkoutService.getCourseBySlug(slug!),
    enabled: !!slug,
  });

  const price = Number(course?.price ?? 0);
  const isFree = price === 0;
  const discount = isFree
    ? 0
    : Math.min(appliedCoupon?.discountAmount ?? 0, price);
  const finalPrice = Math.max(0, price - discount);

  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!course) throw new Error("Không có khóa học để thanh toán");

      // Ghi nhớ khóa học đang thanh toán cho trang kết quả (chỉ dùng để hiển thị CTA)
      try {
        sessionStorage.setItem(
          "piemind:lastCheckout",
          JSON.stringify({ slug: course.slug, title: course.title }),
        );
      } catch {
        // sessionStorage bị chặn — trang kết quả tự ẩn nút liên quan
      }

      const order = await checkoutService.createOrder({
        couponId: !isFree && appliedCoupon ? appliedCoupon.id : undefined,
        items: [
          {
            courseId: Number(course.id),
            instructorId: Number(course.instructorId),
            unitPrice: price,
            finalPrice: isFree ? 0 : finalPrice,
          },
        ],
      });

      if (finalPrice === 0) return { orderId: Number(order.id) };

      const payment = await checkoutService.createPayment({
        orderId: Number(order.id),
        gateway,
        amount: finalPrice,
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

  if (slug && isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-piemind-pink" />
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

  const errorMessage = orderMutation.isError
    ? getApiErrorMessage(
        orderMutation.error,
        isFree
          ? "Đăng ký thất bại. Vui lòng thử lại."
          : "Có lỗi xảy ra. Vui lòng thử lại.",
      )
    : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 pt-5 pb-10 lg:pt-6 lg:pb-14">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Header 1 dòng: Quay lại | Tiêu đề ......... trạng thái bảo mật */}
        <div className="mb-5 flex items-center gap-3 lg:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <span aria-hidden className="h-5 w-px shrink-0 bg-slate-300" />
          <h1 className="min-w-0 truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
            {isFree ? "Đăng ký khóa học" : "Thanh toán"}
          </h1>
          {!isFree && (
            <span className="ml-auto hidden shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-500 sm:inline-flex">
              <Lock className="w-3.5 h-3.5" />
              Thanh toán bảo mật
            </span>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8 items-start">
          {/* LEFT — một khối thống nhất, chia section bằng đường kẻ mảnh */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
            {/* Khóa học */}
            <div className="p-5 sm:p-6">
              <div className="flex gap-4 sm:gap-5">
                <div className="relative w-36 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 hidden sm:flex items-center justify-center">
                  <span className="text-xs text-slate-400">Không có ảnh</span>
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-piemind-pink bg-piemind-pink/10 border border-piemind-pink/20 rounded-full px-2.5 py-0.5 mb-2">
                    {levelLabels[course.level ?? 0] || "Khóa học"}
                  </span>
                  <h2 className="font-bold text-slate-900 text-base sm:text-lg leading-snug line-clamp-2">
                    {course.title}
                  </h2>
                  {course.instructor?.headline && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                      {course.instructor.headline}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                    {typeof course.instructor?.name === "string" &&
                      course.instructor.name && (
                        <span className="font-medium">
                          Giảng viên: {course.instructor.name}
                        </span>
                      )}
                    {course.statistics?.studentCount != null &&
                      course.statistics.studentCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {course.statistics.studentCount} học viên
                        </span>
                      )}
                    {course.statistics?.averageRating != null &&
                      course.statistics.averageRating > 0 && (
                        <span className="inline-flex items-center gap-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {Number(course.statistics.averageRating).toFixed(1)}
                        </span>
                      )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-extrabold text-slate-900">
                    {isFree ? "Miễn phí" : formatCurrency(price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            {!isFree && (
              <div className="p-5 sm:p-6">
                <PaymentMethodSelect value={gateway} onChange={setGateway} />
              </div>
            )}

            {/* Mã giảm giá */}
            {!isFree && (
              <div className="p-5 sm:p-6">
                <VoucherSelect
                  key={course.id}
                  courseId={Number(course.id)}
                  amount={price}
                  selected={appliedCoupon}
                  onSelect={setAppliedCoupon}
                />
              </div>
            )}
          </div>

          {/* RIGHT — Order Summary nổi bật (sticky) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <OrderSummary
                course={course}
                subtotal={price}
                discount={discount}
                couponCode={appliedCoupon?.code}
              >
                {errorMessage && (
                  <div className="p-3.5 bg-rose-50 text-rose-600 text-sm font-medium rounded-xl border border-rose-200">
                    {errorMessage}
                  </div>
                )}

                {isFree ? (
                  <Button
                    onClick={() => orderMutation.mutate()}
                    disabled={orderMutation.isPending}
                    className="w-full h-14 rounded-xl text-base font-bold hover:bg-[#EA6B6B]"
                  >
                    {orderMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
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
                    className="w-full h-14 rounded-xl text-base font-bold hover:bg-[#EA6B6B]"
                  >
                    {orderMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Đang xử lý...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="size-4" />
                        {finalPrice > 0
                          ? `Thanh toán ${formatCurrency(finalPrice)}`
                          : "Đăng ký miễn phí"}
                      </span>
                    )}
                  </Button>
                )}

                <p className="text-center text-xs text-slate-400">
                  Bằng việc thanh toán, bạn đồng ý với điều khoản sử dụng của
                  E-Learning
                </p>
              </OrderSummary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
