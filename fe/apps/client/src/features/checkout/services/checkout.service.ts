import { api } from "@/shared/lib/axios";

export interface CheckoutCourse {
  id: number;
  instructorId: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  instructor?: {
    id: number;
    headline: string | null;
  } | null;
  statistics?: {
    studentCount: number;
    averageRating: number;
    reviewCount: number;
  } | null;
}

export const checkoutService = {
  getCourseBySlug: async (slug: string): Promise<CheckoutCourse> => {
    const { data: res } = await api.get(`/courses/${slug}`);
    return res.data;
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
