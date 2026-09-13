export interface AdminCoupon {
  id: string;
  createdBy: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usageLimitPerUser: number;
  usedCount: number;
  scope: string;
  couponOwnerType: string;
  isActive: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  description: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  courses?: AdminCouponCourse[];
  creator?: { id: string; name: string };
}

export interface AdminCouponDetail extends AdminCoupon {
  courses: AdminCouponCourse[];
  usages?: AdminCouponUsage[];
}

export interface AdminCouponCourse {
  id: string;
  title: string;
  thumbnail: string | null;
  price: number;
}

export interface AdminCouponUsage {
  id: string;
  userId: string;
  userName?: string;
  orderId: string;
  discountApplied: number;
  usedAt: Date | null;
}

export const CouponType = {
  FIXED: "0",
  PERCENTAGE: "1",
} as const;

export type CouponType = (typeof CouponType)[keyof typeof CouponType];

export const couponTypeLabel: Record<CouponType, string> = {
  [CouponType.FIXED]: "Giảm tiền cố định",
  [CouponType.PERCENTAGE]: "Giảm theo %",
};

export const CouponScope = {
  ALL: "0",
  SPECIFIC_COURSES: "1",
} as const;

export type CouponScope = (typeof CouponScope)[keyof typeof CouponScope];

export const couponScopeLabel: Record<CouponScope, string> = {
  [CouponScope.ALL]: "Tất cả khóa học",
  [CouponScope.SPECIFIC_COURSES]: "Khóa học cụ thể",
};

export const CouponOwnerType = {
  ADMIN: "0",
  INSTRUCTOR: "1",
} as const;

export type CouponOwnerType = (typeof CouponOwnerType)[keyof typeof CouponOwnerType];

export const couponOwnerTypeLabel: Record<CouponOwnerType, string> = {
  [CouponOwnerType.ADMIN]: "Quản trị viên",
  [CouponOwnerType.INSTRUCTOR]: "Giảng viên",
};

export const couponStatusClassName = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function formatCouponDiscount(coupon: { discountType: string; discountValue: number; maxDiscountAmount: number | null }) {
  if (coupon.discountType === CouponType.PERCENTAGE) {
    const max = coupon.maxDiscountAmount
      ? ` (tối đa ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(coupon.maxDiscountAmount)})`
      : "";
    return `${coupon.discountValue}%${max}`;
  }
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(coupon.discountValue);
}
