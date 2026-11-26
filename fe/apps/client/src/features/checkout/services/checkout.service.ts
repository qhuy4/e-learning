import { api } from "@/shared/lib/axios";

export interface CheckoutCourse {
  id: number;
  instructorId: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  level?: number;
  instructor?: {
    id: number;
    name?: string | null;
    headline: string | null;
  } | null;
  statistics?: {
    studentCount: number;
    averageRating: number;
    reviewCount: number;
  } | null;
}

/** Mã giảm giá công khai (GET /coupons/active). */
export interface CheckoutCoupon {
  id: number;
  code: string;
  discountType: string; // '0' = cố định, '1' = phần trăm
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  description: string | null;
  validUntil: string | null;
  scope: string;
  maxBookingMinutes: number | null;
}

/** Kết quả kiểm tra mã (POST /coupons/validate) — kèm số tiền giảm thực tế. */
export interface CouponValidationResult extends CheckoutCoupon {
  discountAmount: number;
}

export const checkoutService = {
  getCourseBySlug: async (slug: string): Promise<CheckoutCourse> => {
    const { data: res } = await api.get(`/courses/${slug}`);
    return res.data;
  },

  /** Danh sách mã đang hiệu lực áp dụng cho khóa học. */
  getActiveCoupons: async (params: {
    courseId?: number;
    bookingMinutes?: number;
  }): Promise<CheckoutCoupon[]> => {
    const { data: res } = await api.get("/coupons/active", {
      params,
    });
    return res?.data ?? res ?? [];
  },

  /** Kiểm tra mã giảm giá (theo code hoặc couponId) và lấy số tiền giảm. */
  validateCoupon: async (payload: {
    code?: string;
    couponId?: number;
    courseId?: number;
    bookingMinutes?: number;
    amount: number;
  }): Promise<CouponValidationResult> => {
    const { data: res } = await api.post("/coupons/validate", payload);
    return res?.data ?? res;
  },

  createOrder: async (payload: {
    couponId?: number;
    items: {
      courseId: number;
      instructorId: number;
      unitPrice: number;
      finalPrice: number;
    }[];
  }) => {
    const { data: res } = await api.post("/orders", payload);
    return res.data;
  },

  createPayment: async (payload: {
    orderId: number;
    gateway: string;
    amount: number;
    currency: string;
    description?: string;
  }) => {
    const { data: res } = await api.post("/payments", payload);
    return res.data;
  },

  enrollFreeCourse: async (courseId: number, instructorId: number) => {
    const { data: res } = await api.post("/orders", {
      items: [
        {
          courseId,
          instructorId,
          unitPrice: 0,
          finalPrice: 0,
        },
      ],
    });
    return res.data;
  },
};

/** Lấy thông báo lỗi tiếng Việt từ BE (GlobalExceptionFilter). */
export const getApiErrorMessage = (e: unknown, fallback: string): string => {
  const err = e as {
    response?: { data?: { error?: { message?: string }; message?: string } };
    message?: string;
  };
  return (
    err?.response?.data?.error?.message ??
    err?.response?.data?.message ??
    err?.message ??
    fallback
  );
};
