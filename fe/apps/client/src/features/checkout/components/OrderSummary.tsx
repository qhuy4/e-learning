import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { formatCurrency } from "@fe/lib/utils";

interface OrderSummaryProps {
  course: {
    title: string;
    thumbnail: string | null;
    price: number;
    instructor?: { name?: string | null; headline: string | null } | null;
    statistics?: { studentCount: number; reviewCount: number } | null;
  };
  /** Giá gốc (giá khóa học). Mặc định = price. */
  subtotal?: number;
  /** Số tiền được giảm (0 nếu chưa áp dụng mã). */
  discount?: number;
  couponCode?: string | null;
  children?: ReactNode;
}

export const OrderSummary = ({
  course,
  subtotal = Number(course.price),
  discount = 0,
  couponCode,
  children,
}: OrderSummaryProps) => {
  const safeDiscount = Math.min(Math.max(0, discount), subtotal);
  const total = subtotal - safeDiscount;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.06)] sm:p-6">
      <h3 className="mb-4 text-base font-bold text-slate-900">
        Đơn hàng của bạn
      </h3>

      {/* Khóa học */}
      <div className="mb-5 flex gap-3">
        <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
          <span className="text-[10px] text-slate-400">Không có ảnh</span>
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 line-clamp-2 text-sm font-bold text-slate-900">
            {course.title}
          </p>
          {course.instructor?.name && (
            <p className="line-clamp-1 text-xs text-slate-500">
              {course.instructor.name}
            </p>
          )}
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
            {course.statistics?.studentCount != null && (
              <span>{course.statistics.studentCount} học viên</span>
            )}
            {course.statistics?.reviewCount != null && (
              <span>{course.statistics.reviewCount} đánh giá</span>
            )}
          </div>
        </div>
      </div>

      {/* Chi tiết giá */}
      <div className="space-y-3 border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Giá gốc</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {safeDiscount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-slate-500">
              Giảm giá
              {couponCode && (
                <span className="rounded-md border border-piemind-pink/25 bg-piemind-pink/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-piemind-pink">
                  {couponCode}
                </span>
              )}
            </span>
            <span className="font-bold text-piemind-pink">
              −{formatCurrency(safeDiscount)}
            </span>
          </div>
        )}
      </div>

      {/* Tổng cộng */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-base font-bold text-slate-900">Tổng cộng</span>
        <span className="text-2xl font-extrabold tracking-tight text-piemind-pink sm:text-3xl">
          {total > 0 ? formatCurrency(total) : "Miễn phí"}
        </span>
      </div>

      {/* CTA + ghi chú */}
      {children && <div className="mt-5 space-y-3">{children}</div>}

      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        Giao dịch được xử lý an toàn qua cổng thanh toán
      </div>
    </div>
  );
};
