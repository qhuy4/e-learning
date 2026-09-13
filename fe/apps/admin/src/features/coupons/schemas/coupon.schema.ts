import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(1, "Mã không được để trống").max(32, "Tối đa 32 ký tự"),
  discountType: z.string().min(1, "Chọn loại giảm giá"),
  discountValue: z.coerce.number().min(0, "Giá trị phải lớn hơn 0"),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxDiscountAmount: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().min(1).optional().nullable(),
  usageLimitPerUser: z.coerce.number().min(1).optional(),
  scope: z.string().optional(),
  validFrom: z.string().min(1, "Chọn ngày bắt đầu"),
  validUntil: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  courseIds: z.array(z.string()).optional(),
});

export const updateCouponSchema = z.object({
  code: z.string().min(1, "Mã không được để trống").max(32, "Tối đa 32 ký tự"),
  discountType: z.string().min(1, "Chọn loại giảm giá"),
  discountValue: z.coerce.number().min(0, "Giá trị phải lớn hơn 0"),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxDiscountAmount: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().min(1).optional().nullable(),
  usageLimitPerUser: z.coerce.number().min(1).optional(),
  scope: z.string().optional(),
  validFrom: z.string().min(1, "Chọn ngày bắt đầu"),
  validUntil: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  courseIds: z.array(z.string()).optional(),
});

export type CreateCouponFormData = z.infer<typeof createCouponSchema>;
export type UpdateCouponFormData = z.infer<typeof updateCouponSchema>;
