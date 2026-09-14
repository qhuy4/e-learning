export type ReviewReportStatus = 0 | 1 | 2;

export const reviewReportStatusLabel: Record<ReviewReportStatus, string> = {
  0: "Chờ xử lý",
  1: "Đã xử lý",
  2: "Đã từ chối",
};

export const reviewReportStatusClassName: Record<ReviewReportStatus, string> = {
  0: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  1: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  2: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export interface ReviewReportUser {
  id: number;
  name: string;
  email?: string;
}

export interface ReviewReportCourse {
  id: string;
  title: string;
  slug?: string;
}

export interface ReviewReportReview {
  id: string;
  rating: number;
  comment?: string;
  status: number;
  user?: ReviewReportUser;
  course?: ReviewReportCourse;
}

export interface ReviewReport {
  id: number;
  reason: string;
  status: ReviewReportStatus;
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
  review?: ReviewReportReview;
  reporter?: ReviewReportUser;
  resolver?: ReviewReportUser;
}

export interface PaginatedReviewReportResponse {
  data: ReviewReport[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
