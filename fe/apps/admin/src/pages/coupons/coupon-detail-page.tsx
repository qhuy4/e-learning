import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button.tsx";
import { Badge } from "@fe/components/ui/badge.tsx";
import { Separator } from "@fe/components/ui/separator.tsx";
import { useCoupon, useToggleCouponActive, useDeleteCoupon } from "@/features/coupons/hooks/use-coupon.ts";
import {
  couponStatusClassName,
  couponTypeLabel,
  couponScopeLabel,
  CouponScope,
  formatCouponDiscount,
} from "@/features/coupons/types/coupon";

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="px-6 py-4 border-b">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div>{children}</div>
    </div>
  );
}

export default function CouponDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: coupon, isLoading } = useCoupon(id!);
  const toggleActive = useToggleCouponActive();
  const deleteCoupon = useDeleteCoupon();

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;
    try {
      await deleteCoupon.mutateAsync(id!);
      toast.success("Xóa mã giảm giá thành công");
      navigate("/coupons");
    } catch {
      toast.error("Có lỗi xảy ra khi xóa mã giảm giá");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="p-6">
        <p>Không tìm thấy mã giảm giá</p>
      </div>
    );
  }

  const isActive = coupon.isActive;

  return (
    <div className="p-6">
      <Button variant="ghost" className="mb-4" onClick={() => navigate("/coupons")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono">{coupon.code}</h1>
            <Badge className={isActive ? couponStatusClassName.active : couponStatusClassName.inactive}>
              {isActive ? "Đang sử dụng" : "Tạm dừng"}
            </Badge>
          </div>
          {coupon.description && (
            <p className="text-muted-foreground text-sm mt-1">{coupon.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toggleActive.mutate(id!)}>
            {isActive ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
            {isActive ? "Tạm dừng" : "Kích hoạt"}
          </Button>
          <Button variant="outline" onClick={() => navigate(`/coupons/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Thông tin mã giảm giá">
          <Field label="Mã giảm giá">
            <p className="font-mono font-medium">{coupon.code}</p>
          </Field>
          <Field label="Loại giảm giá">
            <p>{couponTypeLabel[coupon.discountType as keyof typeof couponTypeLabel] ?? "N/A"}</p>
          </Field>
          <Field label="Giá trị giảm">
            <p className="font-medium">{formatCouponDiscount(coupon)}</p>
          </Field>
          {coupon.minOrderAmount > 0 && (
            <Field label="Đơn hàng tối thiểu">
              <p>{formatCurrency(coupon.minOrderAmount)}</p>
            </Field>
          )}
          <Separator />
          <Field label="Phạm vi">
            <p>{couponScopeLabel[coupon.scope as keyof typeof couponScopeLabel] ?? "N/A"}</p>
          </Field>
          {coupon.scope === CouponScope.SPECIFIC_COURSES && coupon.courses && coupon.courses.length > 0 && (
            <Field label="Khóa học áp dụng">
              <div className="space-y-2">
                {coupon.courses.map((course) => (
                  <div key={course.id} className="flex items-center gap-2 text-sm">
                    {course.thumbnail && (
                      <img src={course.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />
                    )}
                    <span>{course.title}</span>
                  </div>
                ))}
              </div>
            </Field>
          )}
          {coupon.creator && (
            <Field label="Người tạo">
              <p>{coupon.creator.name}</p>
            </Field>
          )}
        </Section>

        <div className="space-y-6">
          <Section title="Thống kê">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Đã sử dụng">
                <p className="text-2xl font-bold">
                  {coupon.usedCount}
                  {coupon.usageLimit != null ? `/${coupon.usageLimit}` : ""}
                </p>
              </Field>
              <Field label="Giới hạn / người dùng">
                <p className="text-2xl font-bold">{coupon.usageLimitPerUser}</p>
              </Field>
            </div>
          </Section>

          <Section title="Thời gian">
            <Field label="Ngày bắt đầu">
              <p>{formatDate(coupon.validFrom)}</p>
            </Field>
            <Field label="Ngày kết thúc">
              <p>{formatDate(coupon.validUntil)}</p>
            </Field>
            <Field label="Ngày tạo">
              <p>{formatDate(coupon.createdAt)}</p>
            </Field>
          </Section>
        </div>
      </div>
    </div>
  );
}
