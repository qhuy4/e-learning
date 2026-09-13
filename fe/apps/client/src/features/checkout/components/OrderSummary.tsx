import { formatCurrency } from "@fe/lib/utils";
import type { CheckoutCourse } from "../services/checkout.service";

interface OrderSummaryProps {
  course: CheckoutCourse;
}

export const OrderSummary = ({ course }: OrderSummaryProps) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4">Tóm tắt đơn hàng</h3>

      <div className="flex gap-4 mb-4">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-28 h-20 object-cover rounded-xl shrink-0"
          />
        ) : (
          <div className="w-28 h-20 bg-slate-100 rounded-xl shrink-0 flex items-center justify-center text-slate-400 text-xs">
            Chưa có ảnh
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm line-clamp-2 mb-1">
            {course.title}
          </p>
          {course.instructor?.headline && (
            <p className="text-xs text-slate-500 line-clamp-1">
              {course.instructor.headline}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            {course.statistics?.studentCount != null && (
              <span>{course.statistics.studentCount} học viên</span>
            )}
            {course.statistics?.reviewCount != null && (
              <span>{course.statistics.reviewCount} đánh giá</span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Giá gốc</span>
          <span className="text-slate-700">{formatCurrency(course.price)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Giảm giá</span>
          <span className="text-emerald-600">0 đ</span>
        </div>
        <div className="border-t border-slate-100 pt-2 flex justify-between">
          <span className="font-bold text-slate-900">Tổng cộng</span>
          <span className="font-bold text-rose-500 text-lg">
            {formatCurrency(course.price)}
          </span>
        </div>
      </div>
    </div>
  );
};
