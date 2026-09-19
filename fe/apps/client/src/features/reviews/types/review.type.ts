export interface ReviewImage {
  id: string;
  reviewId: string;
  imageUrl: string;
  createdAt?: string;
}

export interface ReviewUser {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  avatar?: string;
}

export interface ReviewItem {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string | null;
  status: number;
  createdAt: string;
  updatedAt?: string;
  user?: ReviewUser;
  images?: ReviewImage[];
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  starCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CourseReviewsResponse {
  data: ReviewItem[];
  stats: ReviewStats;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReviewEligibilityResponse {
  isEnrolled: boolean;
  canReview: boolean;
  hasReviewed: boolean;
  userReview: ReviewItem | null;
}

export interface CreateReviewPayload {
  rating: number;
  comment?: string;
  imageUrls?: string[];
}
