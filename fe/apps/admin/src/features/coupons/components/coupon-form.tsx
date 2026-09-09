import { Button } from "@fe/components/ui/button.tsx";
import { Input } from "@fe/components/ui/input.tsx";
import { Separator } from "@fe/components/ui/separator.tsx";

import { Label } from "@fe/components/ui/label.tsx";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@fe/components/ui/select.tsx";
import {
  CouponType,
  couponTypeLabel,
  CouponScope,
  couponScopeLabel,
} from "@/features/coupons/types/coupon";
import type { CreateCouponFormData, UpdateCouponFormData } from "@/features/coupons/schemas/coupon.schema";

type CouponFormData = CreateCouponFormData | UpdateCouponFormData;

interface CouponFormProps {
  form: CouponFormData;
  errors: Record<string, string | undefined>;
  setField: (key: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

export function CouponForm({
  form,
  errors,
  setField,
  handleSubmit,
  isSubmitting = false,
  submitLabel = "Tạo mã giảm giá",
  onCancel,
}: CouponFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Thông tin mã giảm giá</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-1.5">
            <Label>Mã giảm giá *</Label>
            <Input
              placeholder="VD: SUMMER50"
              value={form.code ?? ""}
              onChange={(e) => setField("code", e.target.value)}
            />
            {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Mô tả</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Mô tả về mã giảm giá..."
              value={form.description ?? ""}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Loại giảm giá *</Label>
              <Select value={form.discountType ?? ""} onValueChange={(v) => setField("discountType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CouponType.FIXED}>{couponTypeLabel[CouponType.FIXED]}</SelectItem>
                  <SelectItem value={CouponType.PERCENTAGE}>{couponTypeLabel[CouponType.PERCENTAGE]}</SelectItem>
                </SelectContent>
              </Select>
              {errors.discountType && <p className="text-xs text-destructive">{errors.discountType}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Giá trị giảm *</Label>
              <Input
                type="number"
                placeholder={form.discountType === CouponType.PERCENTAGE ? "VD: 10 (%)" : "VD: 50000 (đ)"}
                value={form.discountValue ?? ""}
                onChange={(e) => setField("discountValue", e.target.value)}
              />
              {errors.discountValue && <p className="text-xs text-destructive">{errors.discountValue}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Đơn hàng tối thiểu</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.minOrderAmount ?? ""}
                onChange={(e) => setField("minOrderAmount", e.target.value)}
              />
            </div>

            {form.discountType === CouponType.PERCENTAGE && (
              <div className="space-y-1.5">
                <Label>Giảm tối đa</Label>
                <Input
                  type="number"
                  placeholder="Không giới hạn"
                  value={form.maxDiscountAmount ?? ""}
                  onChange={(e) => setField("maxDiscountAmount", e.target.value)}
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Số lần sử dụng</Label>
              <Input
                type="number"
                placeholder="Để trống = không giới hạn"
                value={form.usageLimit ?? ""}
                onChange={(e) => setField("usageLimit", e.target.value || null)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Giới hạn / người dùng</Label>
              <Input
                type="number"
                placeholder="1"
                value={form.usageLimitPerUser ?? 1}
                onChange={(e) => setField("usageLimitPerUser", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label>Phạm vi áp dụng</Label>
            <Select value={form.scope ?? CouponScope.ALL} onValueChange={(v) => setField("scope", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CouponScope.ALL}>{couponScopeLabel[CouponScope.ALL]}</SelectItem>
                <SelectItem value={CouponScope.SPECIFIC_COURSES}>{couponScopeLabel[CouponScope.SPECIFIC_COURSES]}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.scope === CouponScope.SPECIFIC_COURSES && (
            <div className="space-y-1.5">
              <Label>Khóa học áp dụng</Label>
              <Input placeholder="Chọn khóa học..." disabled />
              <p className="text-xs text-muted-foreground">Chức năng chọn khóa học sẽ được cập nhật sau</p>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Ngày bắt đầu *</Label>
              <Input
                type="date"
                value={form.validFrom ? new Date(form.validFrom).toISOString().split("T")[0] : ""}
                onChange={(e) => setField("validFrom", e.target.value)}
              />
              {errors.validFrom && <p className="text-xs text-destructive">{errors.validFrom}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Ngày kết thúc</Label>
              <Input
                type="date"
                value={form.validUntil ? new Date(form.validUntil).toISOString().split("T")[0] : ""}
                onChange={(e) => setField("validUntil", e.target.value || null)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
