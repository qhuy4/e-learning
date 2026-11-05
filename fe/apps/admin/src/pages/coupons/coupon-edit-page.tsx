import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Separator } from "@fe/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@fe/components/ui/popover";
import { Calendar } from "@fe/components/ui/calendar";
import { Skeleton } from "@fe/components/ui/skeleton";
import { useCoupon, useUpdateCoupon } from "@/features/coupons/hooks/use-coupon.ts";
import { updateCouponSchema } from "@/features/coupons/schemas/coupon.schema";
import { CouponType, couponTypeLabel, CouponScope, couponScopeLabel } from "@/features/coupons/types/coupon";
import { CoursePicker, SelectedCourses } from "@/features/coupons/components/course-picker";
import { cn } from "@fe/lib/utils";

function formatDateDisplay(dateStr: string | null) {
  if (!dateStr) return "Chọn ngày";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface CouponFormState {
  code: string;
  discountType: CouponType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usageLimitPerUser: number;
  scope: CouponScope;
  validFrom: string;
  validUntil: string | null;
  description: string;
  courseIds: string[];
}

function PageSkeleton() {
  return (
    <div className="p-6 mx-auto space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CouponEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: coupon, isLoading } = useCoupon(id!);
  const updateCoupon = useUpdateCoupon();

  const [form, setForm] = useState<CouponFormState>({
    code: "",
    discountType: CouponType.FIXED,
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: null,
    usageLimit: null,
    usageLimitPerUser: 1,
    scope: CouponScope.ALL,
    validFrom: "",
    validUntil: null,
    description: "",
    courseIds: [],
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [openFrom, setOpenFrom] = useState(false);
  const [openUntil, setOpenUntil] = useState(false);

  useEffect(() => {
    if (coupon) {
      setForm({
        code: coupon.code,
        discountType: coupon.discountType as CouponType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        usageLimit: coupon.usageLimit,
        usageLimitPerUser: coupon.usageLimitPerUser,
        scope: coupon.scope as CouponScope,
        validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split("T")[0] : "",
        validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split("T")[0] : null,
        description: coupon.description ?? "",
        courseIds: coupon.courses?.map((c) => String(c.id)) ?? [],
      });
    }
  }, [coupon]);

  const setField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = updateCouponSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    const tid = toast.loading("Đang cập nhật mã giảm giá...");
    try {
      await updateCoupon.mutateAsync({
        id: id!,
        data: {
          code: result.data.code.toUpperCase(),
          discountType: result.data.discountType,
          discountValue: result.data.discountValue,
          minOrderAmount: result.data.minOrderAmount,
          maxDiscountAmount: result.data.maxDiscountAmount ?? undefined,
          usageLimit: result.data.usageLimit ?? undefined,
          usageLimitPerUser: result.data.usageLimitPerUser,
          scope: result.data.scope,
          validFrom: result.data.validFrom,
          validUntil: result.data.validUntil ?? undefined,
          description: result.data.description ?? undefined,
          courseIds: result.data.courseIds,
        },
      });
      toast.success("Cập nhật mã giảm giá thành công!", { id: tid });
      navigate(`/coupons/${id}`);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi cập nhật mã giảm giá";
      toast.error(message, { id: tid });
    }
  };

  if (isLoading) return <PageSkeleton />;

  if (!coupon) {
    return (
      <div className="p-6">
        <p>Không tìm thấy mã giảm giá</p>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/coupons/${id}`)} className="-ml-2">
        <ArrowLeft className="size-4" />
        Quay lại chi tiết
      </Button>

      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-bold">Chỉnh sửa mã giảm giá</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cập nhật thông tin mã giảm giá <span className="font-mono font-medium">{coupon.code}</span>.
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-foreground">Thông tin cơ bản</h3>
              <Separator className="flex-1" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="coupon-code">
                Mã giảm giá <span className="text-destructive">*</span>
              </label>
              <Input
                id="coupon-code"
                value={form.code}
                onChange={(e) => setField("code", e.target.value.toUpperCase())}
                placeholder="VD: SUMMER50"
                className="font-mono"
                aria-invalid={!!errors.code}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="coupon-desc">
                Mô tả
              </label>
              <textarea
                id="coupon-desc"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Mô tả về mã giảm giá..."
                value={form.description ?? ""}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-foreground">Giảm giá</h3>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Loại giảm giá <span className="text-destructive">*</span></label>
                <Select value={form.discountType} onValueChange={(v) => setField("discountType", v)}>
                  <SelectTrigger className="w-full" aria-invalid={!!errors.discountType}>
                    <SelectValue placeholder="Chọn loại giảm giá">
                      {couponTypeLabel[form.discountType]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CouponType.FIXED}>{couponTypeLabel[CouponType.FIXED]}</SelectItem>
                    <SelectItem value={CouponType.PERCENTAGE}>{couponTypeLabel[CouponType.PERCENTAGE]}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.discountType && (
                  <p className="text-xs text-destructive">{errors.discountType}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="coupon-value">
                  Giá trị giảm <span className="text-destructive">*</span>
                </label>
                <Input
                  id="coupon-value"
                  type="number"
                  min={form.discountType === CouponType.PERCENTAGE ? 1 : undefined}
                  max={form.discountType === CouponType.PERCENTAGE ? 100 : undefined}
                  placeholder={form.discountType === CouponType.PERCENTAGE ? "VD: 10 (%)" : "VD: 50000 (đ)"}
                  value={form.discountValue || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (form.discountType === CouponType.PERCENTAGE && val > 100) return;
                    setField("discountValue", val);
                  }}
                  aria-invalid={!!errors.discountValue}
                />
                {errors.discountValue && (
                  <p className="text-xs text-destructive">{errors.discountValue}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="coupon-min-order">
                  Đơn hàng tối thiểu
                </label>
                <Input
                  id="coupon-min-order"
                  type="number"
                  placeholder="0"
                  value={form.minOrderAmount || ""}
                  onChange={(e) => setField("minOrderAmount", Number(e.target.value))}
                />
              </div>

              {form.discountType === CouponType.PERCENTAGE && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="coupon-max-discount">
                    Giảm tối đa
                  </label>
                  <Input
                    id="coupon-max-discount"
                    type="number"
                    placeholder="Không giới hạn"
                    value={form.maxDiscountAmount ?? ""}
                    onChange={(e) => setField("maxDiscountAmount", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-foreground">Giới hạn sử dụng</h3>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="coupon-usage-limit">
                  Số lần sử dụng
                </label>
                <Input
                  id="coupon-usage-limit"
                  type="number"
                  placeholder="Để trống = không giới hạn"
                  value={form.usageLimit ?? ""}
                  onChange={(e) => setField("usageLimit", e.target.value ? Number(e.target.value) : null)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="coupon-per-user">
                  Giới hạn / người dùng
                </label>
                <Input
                  id="coupon-per-user"
                  type="number"
                  placeholder="1"
                  value={form.usageLimitPerUser || 1}
                  onChange={(e) => setField("usageLimitPerUser", Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-foreground">Phạm vi & Thời gian</h3>
              <Separator className="flex-1" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phạm vi áp dụng</label>
              <Select value={form.scope} onValueChange={(v) => setField("scope", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn phạm vi">
                    {couponScopeLabel[form.scope]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CouponScope.ALL}>{couponScopeLabel[CouponScope.ALL]}</SelectItem>
                  <SelectItem value={CouponScope.SPECIFIC_COURSES}>{couponScopeLabel[CouponScope.SPECIFIC_COURSES]}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.scope === CouponScope.SPECIFIC_COURSES && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Khóa học áp dụng</label>
                <CoursePicker
                  value={form.courseIds}
                  onChange={(ids) => setField("courseIds", ids)}
                />
                <SelectedCourses
                  ids={form.courseIds}
                  onRemove={(id) => setField("courseIds", form.courseIds.filter((i) => i !== id))}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Ngày bắt đầu <span className="text-destructive">*</span>
                </label>
                <Popover open={openFrom} onOpenChange={setOpenFrom}>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start font-normal",
                          !form.validFrom && "text-muted-foreground"
                        )}
                      />
                    }
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {formatDateDisplay(form.validFrom)}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.validFrom ? new Date(form.validFrom) : undefined}
                      defaultMonth={form.validFrom ? new Date(form.validFrom) : new Date()}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setField("validFrom", date ? date.toISOString().split("T")[0] : "");
                        setOpenFrom(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {errors.validFrom && (
                  <p className="text-xs text-destructive">{errors.validFrom}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Ngày kết thúc
                </label>
                <Popover open={openUntil} onOpenChange={setOpenUntil}>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start font-normal",
                          !form.validUntil && "text-muted-foreground"
                        )}
                      />
                    }
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {formatDateDisplay(form.validUntil)}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.validUntil ? new Date(form.validUntil) : undefined}
                      defaultMonth={form.validUntil ? new Date(form.validUntil) : new Date()}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setField("validUntil", date ? date.toISOString().split("T")[0] : null);
                        setOpenUntil(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/coupons/${id}`)}
              disabled={updateCoupon.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="outline" disabled={updateCoupon.isPending}>
              {updateCoupon.isPending ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
