import { api } from "@fe/lib/axios";
import type {
  CourseReviewsResponse,
  ReviewEligibilityResponse,
  ReviewItem,
} from "../types/review.type";

export interface CreateReviewParams {
  rating: number;
  comment?: string;
  files?: File[];
  existingImageUrls?: string[];
}

export const reviewService = {
  getCourseReviews: async (
    courseId: string | number,
    params?: { page?: number; limit?: number; rating?: number; sortOrder?: 'asc' | 'desc'; hasImage?: boolean }
  ): Promise<CourseReviewsResponse> => {
    const { data: res } = await api.get(`/reviews/course/${courseId}`, { params });
    return res as CourseReviewsResponse;
  },

  getReviewEligibility: async (
    courseId: string | number
  ): Promise<ReviewEligibilityResponse> => {
    const { data: res } = await api.get(`/reviews/course/${courseId}/eligibility`);
    return res?.data ?? res;
  },

  /**
   * Send review rating, comment AND image files in 1 SINGLE multipart/form-data API request!
   */
  createOrUpdateReview: async (
    courseId: string | number,
    payload: CreateReviewParams
  ): Promise<ReviewItem> => {
    const formData = new FormData();
    formData.append("rating", String(payload.rating));
    if (payload.comment) {
      formData.append("comment", payload.comment);
    }
    if (payload.existingImageUrls && payload.existingImageUrls.length > 0) {
      payload.existingImageUrls.forEach((url) => {
        formData.append("existingImageUrls", url);
      });
    }
    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append("images", file);
      });
    }

    const { data: res } = await api.post(`/reviews/course/${courseId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res?.data ?? res;
  },

  deleteReview: async (reviewId: string | number): Promise<{ success: boolean }> => {
    const { data: res } = await api.delete(`/reviews/${reviewId}`);
    return res?.data ?? res;
  },
};
